import os
import time
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types

from ai.local_fallback import local_fallback


# ==========================================
# Load Environment
# ==========================================

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(
    BASE_DIR / ".env"
)

API_KEY = os.getenv(
    "GEMINI_API_KEY"
)

if not API_KEY:

    raise RuntimeError(
        "❌ GEMINI_API_KEY not found in backend/.env"
    )


# ==========================================
# Gemini Client
# ==========================================

client = genai.Client(
    api_key=API_KEY
)


# ==========================================
# Gemini Response
# ==========================================

def generate_response(
    prompt,
    image_path=None,
    model="gemini-2.5-flash",
    retries=2,
    session_id=None,
    rag_context=None,
    web_context=None,
    user_prompt=None,
):

    # ==========================================
    # ORIGINAL USER PROMPT
    # ==========================================
    #
    # Important:
    # prompt = full final prompt/context
    # user_prompt = actual latest question
    #
    # Fallback should use the original question,
    # NOT the entire conversation/context.
    # ==========================================

    fallback_prompt = (
        user_prompt
        if user_prompt
        else prompt
    )

    last_error = None


    # ==========================================
    # Retry Loop
    # ==========================================

    for attempt in range(retries):

        try:

            contents = []


            # ==========================================
            # Image
            # ==========================================

            if image_path:

                image_file = Path(
                    image_path
                )

                print(
                    "\n========== IMAGE DEBUG =========="
                )

                print(
                    "Image path:",
                    image_path
                )

                print(
                    "Image exists:",
                    image_file.exists()
                )

                if image_file.exists():

                    print(
                        "Image size:",
                        image_file.stat().st_size
                    )

                print(
                    "================================="
                )


                # --------------------------------------
                # Validate image
                # --------------------------------------

                if not image_file.exists():

                    print(
                        "❌ Image file does not exist."
                    )

                else:

                    # ----------------------------------
                    # Upload image to Gemini
                    # ----------------------------------

                    uploaded = client.files.upload(
                        file=str(image_file)
                    )

                    print(
                        "✅ Image uploaded to Gemini"
                    )

                    print(
                        "Uploaded file:",
                        uploaded
                    )

                    contents.append(
                        uploaded
                    )


            # ==========================================
            # Prompt
            # ==========================================

            contents.append(
                prompt
            )


            # ==========================================
            # Gemini Request
            # ==========================================

            response = client.models.generate_content(

                model=model,

                contents=contents,

                config=types.GenerateContentConfig(
                    temperature=0.4
                ),
            )


            # ==========================================
            # Empty Response
            # ==========================================

            if (
                not response
                or not response.text
            ):

                print(
                    "⚠️ Gemini returned an empty response."
                )

                return local_fallback(

                    fallback_prompt,

                    session_id=session_id,

                    rag_context=rag_context,

                    web_context=web_context
                )


            # ==========================================
            # Successful Response
            # ==========================================

            return response.text


        except Exception as e:

            last_error = e

            error_text = str(e)


            print(
                f"\n⚠ Gemini Error "
                f"({attempt + 1}/{retries})"
            )

            print(
                error_text
            )


            # ==========================================
            # QUOTA / RATE LIMIT
            # ==========================================

            if (
                "429" in error_text
                or "RESOURCE_EXHAUSTED" in error_text
                or "quota" in error_text.lower()
            ):

                print(
                    "⚠️ Gemini API quota exceeded."
                )

                print(
                    "🔄 Switching to local fallback..."
                )

                return local_fallback(

                    fallback_prompt,

                    session_id=session_id,

                    rag_context=rag_context,

                    web_context=web_context
                )


            # ==========================================
            # TEMPORARY SERVER ERROR
            # ==========================================

            if (
                "503" in error_text
                or "UNAVAILABLE" in error_text
            ):

                if attempt < retries - 1:

                    wait = 5 * (
                        attempt + 1
                    )

                    print(
                        f"⚠️ Gemini temporarily "
                        f"unavailable. "
                        f"Retrying in {wait}s..."
                    )

                    time.sleep(
                        wait
                    )

                    continue


                print(
                    "🔄 Switching to local fallback..."
                )

                return local_fallback(

                    fallback_prompt,

                    session_id=session_id,

                    rag_context=rag_context,

                    web_context=web_context
                )


            # ==========================================
            # Other Errors
            # ==========================================

            print(
                "❌ Gemini request failed."
            )

            return local_fallback(

                fallback_prompt,

                session_id=session_id,

                rag_context=rag_context,

                web_context=web_context
            )


    # ==========================================
    # Final Fallback
    # ==========================================

    if last_error:

        print(
            "❌ Final Gemini Error:",
            last_error
        )

        return local_fallback(

            fallback_prompt,

            session_id=session_id,

            rag_context=rag_context,

            web_context=web_context
        )


    return local_fallback(

        fallback_prompt,

        session_id=session_id,

        rag_context=rag_context,

        web_context=web_context
    )
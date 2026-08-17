from ai.gemini import generate_response


def reflect(prompt, observations):

    observation_text = "\n".join(observations)

    reflection_prompt = f"""
You are an AI Reflection Engine.

User Question:
{prompt}

Observations:
{observation_text}

Determine whether enough information has been collected.

Reply ONLY with one word:

YES
or
NO

Do not explain.
"""

    try:

        result = generate_response(reflection_prompt)

        result = result.strip().upper()

        if "YES" in result:
            return True

        return False

    except Exception as e:

        print("Reflection Error:", e)

        return True
import re


MEMORY_PATTERNS = {

    "name": [
        r"my name is ([A-Za-z ]+)",
        r"i am ([A-Za-z ]+)"
    ],

    "city": [
        r"i live in ([A-Za-z ]+)",
        r"i'm from ([A-Za-z ]+)"
    ],

    "country": [
        r"i live in .*?, ([A-Za-z ]+)"
    ],

    "profession": [
        r"i am a ([A-Za-z ]+)",
        r"i work as a ([A-Za-z ]+)"
    ],

    "language": [
        r"my favorite language is ([A-Za-z+# ]+)"
    ],

    "framework": [
        r"my favorite framework is ([A-Za-z0-9 .#]+)"
    ],

    "goal": [
        r"my goal is (.+)",
        r"i want to (.+)"
    ],

}


def extract_memory(text: str):

    text = text.lower()

    memories = {}

    for key, patterns in MEMORY_PATTERNS.items():

        for pattern in patterns:

            match = re.search(pattern, text)

            if match:

                memories[key] = match.group(1).strip().title()

                break

    return memories
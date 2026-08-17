def select_tools(prompt):

    prompt = prompt.lower()

    return {

        "memory": any(word in prompt for word in [
            "remember",
            "my",
            "name",
            "birthday",
            "age",
            "who am i"
        ]),

        "rag": any(word in prompt for word in [
            "pdf",
            "document",
            "file",
            "upload",
            "resume",
            "notes",
            "report"
        ]),

        "image": any(word in prompt for word in [
            "image",
            "photo",
            "picture",
            "screenshot",
            "diagram",
            "graph"
        ]),

        "web": any(word in prompt for word in [
            "today",
            "latest",
            "news",
            "weather",
            "live",
            "current",
            "ipl",
            "stock",
            "bitcoin"
        ])

    }
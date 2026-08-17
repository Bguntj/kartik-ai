class AgentState:

    def __init__(self):

        self.prompt = ""

        self.history = ""

        self.memory = ""

        self.rag = ""

        self.web = ""

        self.image = None

        self.observations = []

        self.used_tools = []

        self.thoughts = []

        self.finished = False

        self.reflection = ""
    def add_observation(self, tool, result):

        self.used_tools.append(tool)

        self.observations.append({

            "tool": tool,
            "result": result

        })

    def add_thought(self, thought):

        self.thoughts.append(thought)

    def latest_observation(self):

        if not self.observations:
            return ""

        obs = self.observations[-1]

        return f"{obs['tool']} -> {obs['result']}"

    def build_reasoning(self):

        text = ""

        for i, thought in enumerate(self.thoughts):

            text += f"Thought {i+1}: {thought}\n"

            if i < len(self.observations):

                obs = self.observations[i]

                text += (
                    f"Observation: "
                    f"{obs['tool']} -> "
                    f"{obs['result']}\n\n"
                )

        return text
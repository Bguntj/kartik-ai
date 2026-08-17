from ddgs import DDGS


def web_search(query, max_results=5):

    results = []

    try:

        print("\n========== WEB SEARCH ==========")
        print("Query:", query)

        with DDGS() as ddgs:

            search_results = list(
                ddgs.text(
                    query,
                    max_results=max_results
                )
            )

        print("Results Found:", len(search_results))

        for item in search_results:

            result = {

                "title": item.get("title", ""),

                "body": item.get("body", ""),

                "link": item.get("href", item.get("url", ""))

            }

            print(result)

            results.append(result)

        print("================================\n")

    except Exception as e:

        print("\n❌ WEB SEARCH ERROR")
        print(e)
        print()

    return results
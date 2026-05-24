import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
TOPICS_DIR = BASE_DIR / "content-topics"
OUTPUT_DIR = BASE_DIR / "content-output"

OUTPUT_DIR.mkdir(exist_ok=True)


def generate_markdown(data):
    title = data.get("title", "")
    patient_question = data.get("patient_question", "")
    reel_script = data.get("reel_script", "")
    doctor_name = data.get("doctor_name", "")
    hospital_name = data.get("hospital_name", "")
    location = data.get("location", "")
    faqs = data.get("faq_questions", [])
    internal_links = data.get("internal_links", [])
    cta = data.get("cta", "")

    markdown = f"""
# {title}

## Patient Question

{patient_question}

---

## Doctor Explanation

{reel_script}

---

## Key Points

- Fertility awareness
- Lifestyle guidance
- Early medical consultation helps
- Personalized treatment is important

---

## Frequently Asked Questions
"""

    for faq in faqs:
        markdown += f"""
### {faq}

Answer coming soon.
"""

    markdown += "\n---\n\n## Related Pages\n"

    for link in internal_links:
        markdown += f"- {link}\n"

    markdown += f"""

---

## Consult Fertility Specialist

{cta}

**{doctor_name}**  
**{hospital_name}**  
**{location}**
"""

    return markdown


def process_json_file(json_path):
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    slug = data.get("slug", json_path.stem)

    markdown_content = generate_markdown(data)

    output_file = OUTPUT_DIR / f"{slug}.md"

    with open(output_file, "w", encoding="utf-8") as f:
        f.write(markdown_content)

    print(f"Generated: {output_file}")


def main():
    json_files = list(TOPICS_DIR.rglob("*.json"))

    if not json_files:
        print("No JSON files found.")
        return

    for json_file in json_files:
        process_json_file(json_file)


if __name__ == "__main__":
    main()
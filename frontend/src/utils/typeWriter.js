export async function typeWriter(text, onUpdate, speed = 15) {

  const words = text.split(" ");

  let current = "";

  for (let i = 0; i < words.length; i++) {

    current += words[i] + " ";

    onUpdate(current);

    await new Promise((resolve) =>
      setTimeout(resolve, speed)
    );

  }

}
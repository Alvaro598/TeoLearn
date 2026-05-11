import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({
  baseURL:
    "https://openrouter.ai/api/v1",

  apiKey:
    process.env.OPENROUTER_API_KEY,
});

async function test() {

  try {

    const completion =
      await openai.chat.completions.create({

        model:
          "openai/gpt-3.5-turbo",

        messages: [
          {
            role: "user",
            content: "Hola",
          },
        ],
      });

    console.log(
      completion.choices[0]
      .message.content
    );

  } catch (error) {

    console.log(error);
  }
}

test();
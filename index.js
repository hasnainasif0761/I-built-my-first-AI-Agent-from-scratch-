const dotenv = require('dotenv');
const OpenAI = require('openai');
dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPEN_AI_API,
    baseURL: "https://openrouter.ai/api/v1"
});

function getWeatherDetail(city = '') {
    city = city.trim().toLowerCase();
    console.log("Weather function called for:", city);
    if (city === "patiala") return '10°C';
    if (city === "mohali") return '14°C';
    if (city === "bangalore") return '20°C'; 
    if (city === "chandigarh") return '8°C';
    if (city === "delhi") return '12°C';
    return 'City ka data mere pas nahi hai';
}

const SYSTEM_PROMPT = `
You are an AI Assistant with START, PLAN, ACTION, OBSERVATION and OUTPUT State.
Wait for the user prompt and first PLAN using available tools.
After Planning, Take the action with appropriate tools and wait for Observation based on Action.
Once you get the Observations, Return the AI response based on START prompt and Observation.

Available Tools:
- function getWeatherDetail(city:string):string

Example:
START
{"type":"user","user":"What is the sum of weather of Patiala and Mohali?"}
{"type":"plan","plan":"I will call the getWeatherDetail for Patiala"}
{"type":"action","function":"getWeatherDetail","input":"patiala"}
{"type":"observation","observation":"10°C"}
{"type":"plan","plan":"I will call the getWeatherDetail for Mohali"}
{"type":"action","function":"getWeatherDetail","input":"mohali"}
{"type":"observation","observation":"14°C"}
{"type":"output","output":"The sum of weather of Patiala and Mohali is 24°C"}

Rules:
- Always output valid JSON on each line
- Always use small letters for city name in input
`;

async function chat() {
    const user = "Hey, What is the sum of patia;a";

    let messages = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: user }
    ];

    while (true) {
        const result = await client.chat.completions.create({
            model: "openai/gpt-3.5-turbo",
            messages: messages
        });

        const content = result.choices[0].message.content;
        console.log(content); // har step dekho
        messages.push({ role: "assistant", content: content });

        if (content.includes('"type":"output"')) {
            break;
        }

        const actionMatch = content.match(/"type":"action".*"input":"([^"]+)"/);
        if (actionMatch) {
            const city = actionMatch[1];
            const weather = getWeatherDetail(city);

            const observation = `{"type":"observation","observation":"${weather}"}`;
            console.log(observation);
            messages.push({ role: "user", content: observation });
        }
    }
}

chat();
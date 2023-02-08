import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import request from 'request';
import { Configuration, OpenAIApi } from "openai";
import trainingData from './trainingData.js'; // import the training data script

dotenv.config();

console.log(process.env.OPENAI_API_KEY);

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, 
});
const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors());

app.use(express.json());

app.get('/', async (req, res) => {
    res.status(200).send({
        message: 'Hello from Eldia'
    })
});

// Code for creating the finetuned model
const modelName = "Eldia";

const createModel = async () => {
  try {
    const response = await openai.createGPT3Model({
      name: modelName,
      engine: "text-davinci-003",
      data: trainingData,
      override: true,
    });
    
    console.log(`Finetuned model "${modelName}" created successfully.`);
  } catch (error) {
    console.error("Error while creating the finetuned model:", error);
  }
};

app.post('/', async (req, res) => {
  try {
    const modelName = "Eldia";
    const prompt = req.body.prompt;
    const response = await openai.createCompletion({
      model: modelName,
      prompt: `${prompt}`,
      temperature: 0,
      max_tokens: 3000,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0
    });

    console.log("Response data:", response.data);

    res.status(200).send({
      bot: response.data.choices[0].text
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ error });
  }
});

// Call the createModel function when the server starts
createModel();

app.listen(5000, () => console.log('Server is running on http://localhost:5000'));

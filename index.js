// Import necessary libraries and modules
const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');

// Create an instance of Express app
const app = express();

// Define the port number
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/states', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// Define the States schema
const statesSchema = new mongoose.Schema({
  stateCode: {
    type: String,
    required: true,
    unique: true,
  },
  funfacts: [String],
});

// Create the States model
const States = mongoose.model('States', statesSchema);

// Read the states.json file
const statesData = JSON.parse(fs.readFileSync('states.json'));

// Define the API endpoints
app.get('/states', async (req, res) => {
  try {
    // Get all state data from states.json
    let allStatesData = statesData;

    // Get all state data from MongoDB
    const statesFromDB = await States.find({}, { _id: 0, __v: 0 });

    // Merge the two data sources
    allStatesData = allStatesData.map((state) => {
      const stateFromDB = statesFromDB.find((s) => s.stateCode === state.code);
      if (stateFromDB) {
        return { ...state, funfacts: stateFromDB.funfacts };
      }
      return state;
    });

    // Return all state data
    res.json(allStatesData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/states/:state', async (req, res) => {
  try {
    // Get the state code from the URL parameter
    const stateCode = req.params.state.toUpperCase();

    // Get the state data from states.json
    const stateData = statesData.find((state) => state.code === stateCode);

    // Get the state data from MongoDB
    const stateFromDB = await States.findOne({ stateCode }, { _id: 0, __v: 0 });

    // Merge the two data sources
    const mergedStateData = { ...stateData, funfacts: stateFromDB.funfacts };

    // Return the state data
    res.json(mergedStateData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/states/:state/funfact', async (req, res) => {
  try {
    // Get the state code from the URL parameter
    const stateCode = req.params.state.toUpperCase();

    // Get the state data from MongoDB
    const stateFromDB = await States.findOne({ stateCode }, { _id: 0, __v: 0 });

    // Get a random fun fact from the state data
    const randomFunFact = stateFromDB.funfacts[Math.floor(Math.random() * stateFromDB.funfacts.length)];

    // Return the random fun fact
    res.json({ funfact: randomFunFact });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/states/:state/capital', async (req, res) => {
  try {
    // Get the state code from the URL parameter
    const stateCode = req.params.state.toUpperCase();

    // Get the state data from states.json
    const stateData = statesData.find((state) => state.code === stateCode);

    // Return the state capital
    res.json({ state: stateData.name, capital: stateData.capital });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/states/:state/nickname', async (req, res) => {
  try {
    // Get the state code from the URL parameter
    const stateCode = req.params.state.toUpperCase();

    // Get the state data from states.json
    const stateData = statesData.find((state) => state.code === stateCode);

    // Return the state nickname
    res.json({ state: stateData.name, nickname: stateData.nickname });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/states/:state/population', async (req, res) => {
  try {
    // Get the state code from the URL parameter
    const stateCode = req.params.state.toUpperCase();

    // Get the state data from states.json
    const stateData = statesData.find((state) => state.code === stateCode);

    // Return the state population
    res.json({ state: stateData.name, population: stateData.population });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/states/:state/admission', async (req, res) => {
  try {
    // Get the state code from the URL parameter
    const stateCode = req.params.state.toUpperCase();

    // Get the state data from states.json
    const stateData = statesData.find((state) => state.code === stateCode);

    // Return the state admission date
    res.json({ state: stateData.name, admitted: stateData.admission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/states', async (req, res) => {
  try {
    // Get the contig query parameter
    const contig = req.query.contig;

    // Get all state data from states.json
    let allStatesData = statesData;

    // Get all state data from MongoDB
    const statesFromDB = await States.find({}, { _id: 0, __v: 0 });

    // Merge the two data sources
    allStatesData = allStatesData.map((state) => {
      const stateFromDB = statesFromDB.find((s) => s.stateCode === state.code);
      if (stateFromDB) {
        return { ...state, funfacts: stateFromDB.funfacts };
      }
      return state;
    });

    // Filter the state data based on the contig query parameter
    if (contig === 'true') {
      allStatesData = allStatesData.filter((state) => state.contiguous);
    } else if (contig === 'false') {
      allStatesData = allStatesData.filter((state) => !state.contiguous);
    }

    // Return the filtered state data
    res.json(allStatesData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/states/:state/funfact', async (req, res) => {
  try {
    // Get the state code from the URL parameter
    const stateCode = req.params.state.toUpperCase();

    // Get the funfacts array from the request body
    const { funfacts } = req.body;

    // Find the state in MongoDB
    const stateFromDB = await States.findOne({ stateCode });

    // Add the new fun facts to the existing funfacts array
    stateFromDB.funfacts.push(...funfacts);

    // Save the updated state data to MongoDB
    await stateFromDB.save();

    // Return the updated state data
    res.json(stateFromDB);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.patch('/states/:state/funfact', async (req, res) => {
  try {
    // Get the state code from the URL parameter
    const stateCode = req.params.state.toUpperCase();

    // Get the index and new fun fact from the request body
    const { index, funfact } = req.body;

    // Find the state in MongoDB
    const stateFromDB = await States.findOne({ stateCode });

    // Replace the old fun fact with the new fun fact
    stateFromDB.funfacts[index - 1] = funfact;

    // Save the updated state data to MongoDB
    await stateFromDB.save();

    // Return the updated state data
    res.json(stateFromDB);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Define the catch-all route
app.all('*', (req, res) => {
  if (req.accepts('html')) {
    res.status(404).send('<h1>404 Not Found</h1>');
  } else if (req.accepts('json')) {
    res.status(404).json({ error: '404 Not Found' });
  } else {
    res.status(404).send('404 Not Found');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

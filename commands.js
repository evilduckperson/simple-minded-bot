import 'dotenv/config';
import { getRPSChoices } from './game.js';
import { capitalize, InstallGlobalCommands } from './utils.js';
import { MessageComponentTypes } from 'discord-interactions';

// Get the game choices from game.js
function createCommandChoices() {
  const choices = getRPSChoices();
  const commandChoices = [];

  for (let choice of choices) {
    commandChoices.push({
      name: capitalize(choice),
      value: choice.toLowerCase(),
    });
  }

  return commandChoices;
}

// Simple test command
const TEST_COMMAND = {
  name: 'test',
  description: 'Basic command',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const DADJOKE_COMMAND = {
  name: 'dadjoke',
  description: 'Get a random dad joke!',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const BOT_COMMAND = {
  name: 'yourabot',
  description: 'Insult Me',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const SAY_COMMAND = {
  name: 'say',
  description: 'Make the bot say something',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};


// Command containing options
const CHALLENGE_COMMAND = {
  name: 'rps',
  description: 'Challenge someone to a match of rock paper scissors',
  options: [
    {
      type: 6,
      name: 'user',
      description: 'Pick your opponent',
      required: true,
      choices: createCommandChoices(),
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};

const UNSHUFFLE_COMMAND = {
  name: 'unshuffle',
  description: 'Unshuffle a word I give you',
  options: [
    {
      type: 4,
      name: 'level',
      description: 'How hard do you want the game to be',
      required: true,
      choices: [
        { name: 'easy',
          value:60000,
        },
        { name: 'medium',
          value:30000,
        },
        { name:'hard',
          value:15000,
        }
      ],
    },
  ],
  type: 1
}

const ROBOT_COMMAND = {
  name: 'robotcheck',
  description: 'Check if a user is a robot',
  type: 1,
  options: [{
    type:6,
    name:"user",
    description:"What user you would like to mention",
    required:true,
  }
  ]
};

const QUOTE_COMMAND = {
  name: 'quotify',
  type: 3
}

const IDENTIFY_COMMAND = {
  name: 'identify',
  description: 'Some info on a user',
  type: 1,
  options: [{
    type:6,
    name:"user",
    description:"What user you would like to identify",
    required:true,
  }
  ]
}

const HANGMAN_COMMAND = {
  name: 'hangman',
  description: 'Play a game of hangman against the bot',
  options: [
    {
      type: 4,
      name: 'level',
      description: 'How hard do you want the game to be',
      required: true,
      choices: [
        { name: 'easy',
          value:1,
        },
        { name: 'medium',
          value:2,
        },
        { name:'hard',
          value:3,
        }
      ],
    },
  ],
  type: 1,
}

const HELP_COMMAND = {
  name: 'help',
  description: 'View the bots help interface',
  type: 1,
}

const FISHING_COMMAND = {
  name: 'fishingsimulator',
  description: 'Play our amazing fishing simulator!',
  type: 1,
}


const ALL_COMMANDS = [TEST_COMMAND, DADJOKE_COMMAND, BOT_COMMAND, SAY_COMMAND, CHALLENGE_COMMAND, UNSHUFFLE_COMMAND, ROBOT_COMMAND, QUOTE_COMMAND, IDENTIFY_COMMAND, HANGMAN_COMMAND, HELP_COMMAND, FISHING_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
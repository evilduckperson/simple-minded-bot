import 'dotenv/config';
import express from 'express';
import {
  ButtonStyleTypes,
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  MessageComponentTypes,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { getRandomEmoji, DiscordRequest } from './utils.js';
import { getShuffledOptions } from './game.js';
import dadJokes from './dadJokes.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// To keep track of our active games
const activeGames = {};
// Unshuffle  timestamp and timelimit
let timestamp 
let timeLimit
// hangman command
let splitLetters
// user stuff
let user_id
// modal submit text
let text
// hangman command underscores
let underScores
// hangman wrong guesses
let wrongGuesses
// hangman storage
let guessStorage
// hangman stages
let hangmanStages
// physical wrong guesses for hangman
let wrongGuessLetters
// second question modal
let text1
// check if button = command user
let commandRunner
// rps opponent
let MentionedUserID
// rps counter
let player
// rps players
let playerOne
let playerOneObject
let playerTwo
let playerTwoObject
// check if a user is in a game our not 
const activeRPSPlayers = new Set();

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */

app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  // Interaction id, type and data
  const { id, type, data } = req.body;

  // you could put non exist variable in functions because then it can be anything
  function checkGameEnded(guessStorage) {
    for (let i = 0; i < guessStorage.length; i++) {
       if (guessStorage[i] == "_") {
        return false;
      }
     }
        return true;
  }
  

  // for the "say" and "unshuffle" command (down below)
  if (type === InteractionType.MODAL_SUBMIT) {
    const {custom_id,components} = data
    text = components[0].components[0].value
    const badWords =                                                                                                                                                                                                                                                            ["nigger", "niggers", "nigga", "nigga's", "n1gga", "n1gger", "retard", "retarded", "twat", "retards", "fucker", "fuck", "bitch", "bitches"]
    const SneakyBadWOrd = badWords.some(badWords => text.includes(badWords));
      if (custom_id === `message`) {
        if (badWords.includes(text)) {
          console.log ("User Bad Word Usage")
          console.log (user_id)
          console.log (text)
          return res.send({ 
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content:"That is a bad word. Please don't use that word in our bot again. If you say another slur/bad word, you will be banned from using this bot. No appeals."
              }
          });
        } 
        if (SneakyBadWOrd) {
          console.log ("User Bad Word Usage")
          console.log (user_id)
          console.log (text)
          return res.send({ 
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content:"That is a bad word. Please don't use that word in our bot again. If you say another slur/bad word, you will be banned from using this bot. No appeals."
              }
          });
        }
    return res.send({ 
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content:text
    }
  });
  }
  if (custom_id === `unshuffle`) {
    if (badWords.includes(text)) {
      console.log ("User Bad Word Usage")
      console.log (user_id)
      console.log (text)
      return res.send({ 
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content:"That is a bad word. Please don't use that word in our bot again. If you say another slur/bad word, you will be banned from using this bot. No appeals."
        }
      });
    }
      if (SneakyBadWOrd) {
        console.log ("User Bad Word Usage")
        console.log (user_id)
        console.log (text)
        return res.send({ 
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content:"That is a bad word. Please don't use that word in our bot again. If you say another slur/bad word, you will be banned from using this bot. No appeals."
            }
        });
      }
     
    let timestamp2 = Date.now()
    timestamp2-=timestamp
    if (timestamp2>=timeLimit) {
      return res.send({ 
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content:"You ran out of time to respond, sorry!"
        }
      });
    }
    if (activeGames[req.body.member.user.id] === text) {
      return res.send({ 
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content:`You got it! The correct answer was **${text}**!`
        }
      });
    }
    else {
      return res.send({ 
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content:`That was the wrong answer, sorry. The correct answer was **${activeGames[req.body.member.user.id]}**. You answered **${text}**. Remember, it only works if you use only lowercase!`
        }
      });
    }
  }
  if (custom_id === `hangman`) {
    if (badWords.includes(text)) {
      console.log ("User Bad Word Usage")
      console.log (user_id)
      console.log (text)
      return res.send({ 
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content:"That is a bad word. Please don't use that word in our bot again. If you say another slur/bad word, you will be banned from using this bot. No appeals."
        }
      });
    } 
    if (SneakyBadWOrd) {
      console.log ("User Bad Word Usage")
      console.log (user_id)
      console.log (text)
      return res.send({ 
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content:"That is a bad word. Please don't use that word in our bot again. If you say another slur/bad word, you will be banned from using this bot. No appeals."
          }
      });
    }
    if (splitLetters.includes(text)) {
      console.log ("Split letters", splitLetters.indexOf(text))
       let displayArray = underScores.split("");
       for (let i = 0; i < splitLetters.length; i++) {
      if (splitLetters[i] === text) {
      displayArray[i] = text;
    }
    else if (guessStorage != null) {
      if (guessStorage [i] != "_") {
        displayArray[i] = guessStorage[i]
      }
    }
    }  
    guessStorage = displayArray
    underScores = displayArray.join("");
      console.log ("underScores", underScores)
      console.log ("guessStorage", guessStorage)
      if (checkGameEnded(guessStorage) == false) {
        return res.send ({
          type: InteractionResponseType.UPDATE_MESSAGE,
          data: {             
             content: `\`\`\`Hangman:\n${hangmanStages[wrongGuesses]}\nWord:\n\`${underScores.replaceAll("_","_ ")}\`\nWrong Guesses:\n${wrongGuessLetters}\nREMEMBER, IN YOUR GUESSES USE ONLY LOWERCASE LETTERS\`\`\``,
             components: [
              {
                  type: MessageComponentTypes.ACTION_ROW,
                  components: [
                  {
                      type: MessageComponentTypes.BUTTON,
                      // Append the game ID to use later on
                      custom_id: `guess_button_${req.body.id}`,
                      label: 'Guess',
                      style: ButtonStyleTypes.PRIMARY
                  },
                  ],
              },
              ],
          },
      });
    }
    else {
      guessStorage = []
      return res.send ({
        type: InteractionResponseType.UPDATE_MESSAGE,
        data: {             
           content: `\`\`\`Hangman:\n${hangmanStages[wrongGuesses]}\nWord:\n\`${underScores.replaceAll("_","_ ")}\`\nWrong Guesses:\n${wrongGuessLetters}\nYOU GOT THE WORD! THE WORD WAS ${underScores}! NICE JOB!\`\`\``,
        },
    });

    }  
    } 
    else {
      wrongGuessLetters.push(text)
      wrongGuesses = wrongGuesses+1
      console.log (wrongGuessLetters)
      if (wrongGuesses == "6") {
        guessStorage = []
        return res.send ({
          type: InteractionResponseType.UPDATE_MESSAGE,
          data: {             
             content: `\`\`\`Hangman:\n${hangmanStages[wrongGuesses]}\nWord:\n\`${underScores.replaceAll("_","_ ")}\`\nWrong Guesses:\n${wrongGuessLetters}\nYOU LOST, SORRY! TRY AGAIN NEXT TIME!\`\`\``,
          },
      });
      }
      return res.send ({
        type: InteractionResponseType.UPDATE_MESSAGE,
        data: {             
           content: `\`\`\`Hangman:\n${hangmanStages[wrongGuesses]}\nWord:\n\`${underScores.replaceAll("_","_ ")}\`\nWrong Guesses:\n${wrongGuessLetters}\nREMEMBER, IN YOUR GUESSES USE ONLY LOWERCASE LETTERS\`\`\``,
           components: [
            {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                {
                    type: MessageComponentTypes.BUTTON,
                    // Append the game ID to use later on
                    custom_id: `guess_button_${req.body.id}`,
                    label: 'Guess',
                    style: ButtonStyleTypes.PRIMARY
                },
                ],
            },
            ],
        },
    });
    }
  }
    if (custom_id == "bug") {
      console.log ("BUG REPORT BELOW, PLEASE READ")
      console.log (text)
      return res.send ({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Report Sent! Thank you!',
          flags: InteractionResponseFlags.EPHEMERAL
        }
      });
    }
    if (custom_id == "report") {
      text1 = components[1].components[0].value
      console.log (user_id)
      console.log ("USER REPORT ID")
      console.log (text)
      console.log ("USER REPORT CONTENT")
      console.log (text1)
      return res.send ({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Report Sent! Thank you!',
          flags: InteractionResponseFlags.EPHEMERAL
        }
      });
    }
  }

        // challenge button 
        if (type === InteractionType.MESSAGE_COMPONENT) {
          // custom_id set in payload when sending message component
        const componentId = data.custom_id;
      
        if (componentId.startsWith('choose_button_')) {
          const userId = req.body.member?.user?.id || req.body.user?.id;
          if (userId !== user_id && userId !== MentionedUserID) {
            return res.send ({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: 'This game isn\'t for you! Sorry!',
                flags: InteractionResponseFlags.EPHEMERAL
              }
            });
          }


            return res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: 'What is your object of choice?',
                flags: InteractionResponseFlags.EPHEMERAL,
                components: [
                  {
                    type: MessageComponentTypes.ACTION_ROW,
                    components: [
                      {
                        type: MessageComponentTypes.STRING_SELECT,
                        // Append game ID
                        custom_id: `select_choice_${req.body.member.user.id}`,
                        options: getShuffledOptions(),
                      },
                    ],
                  },
                ],
              },
            });
        }
        else if (componentId.startsWith('select_choice_')) {
          player++
      

            const userId = req.body.member?.user?.id || req.body.user?.id;
            const objectName = data.values[0];

            if (userId !== user_id && userId !== MentionedUserID) {
              return res.send ({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                  content: 'This game isn\'t for you! Sorry!',
                  flags: InteractionResponseFlags.EPHEMERAL
                }
              });
            }
            else {
              // whoever clicks the "make your selection" first is player one
              if (player === 1) {
                playerOne = userId
                playerOneObject = objectName
                return res.send ({
                  type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                  data: {
                    content: `Nice choice! Wait for the other person to pick. Picking twice doesn't work!`,
                    flags: InteractionResponseFlags.EPHEMERAL
                  }
                });
              }
              else {
              if (player === 2 && userId !== playerOne) {
                playerTwo = userId
                playerTwoObject = objectName
              }
                if (playerTwoObject === playerOneObject) {
                  return res.send ({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                      content: `You tied! You both picked ${playerOneObject}!`,
                    }
                  });
                }
                else {
                  if (playerOneObject ===  "rock") {
                    if (playerTwoObject === "paper") {
                      return res.send ({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                          content: `<@${playerTwo}> won with paper! Nice job!`,
                        }
                      });
                    }
                    else if (playerOneObject === "scissors") {
                      return res.send ({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                          content: `<@${playerOne}> won with rock! Nice job!`,
                        }
                      });
                    }
                  }
                  else if (playerOneObject === "paper") {
                      if (playerTwoObject === "rock") {
                        return res.send ({
                          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                          data: {
                            content: `<@${playerOne}> won with paper! Nice job!`,
                          }
                        });
                      }
                      else if (playerOneObject === "scissors") {
                        return res.send ({
                          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                          data: {
                            content: `<@${playerTwo}> won with scissors! Nice job!`,
                          }
                        });
                      }
                  }
                  else if (playerOneObject === "scissors") {
                    if (playerTwoObject === "paper") {

                      return res.send ({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                          content: `<@${playerOne}> won with scissors! Nice job!`,
                        }
                      });
                    }
                    else if (playerOneObject === "rock") {
                      return res.send ({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                          content: `<@${playerTwo}> won with rock! Nice job!`,
                        }
                      });
                    }
                  }
                  else {
                    return res.send ({
                      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                      data: {
                        content: `Error! I don't know what happened!`,
                      }
                    });
                  }
                }
                activeRPSPlayers.delete(MentionedUserID);
                activeRPSPlayers.delete(user_id);
            }
            }    
          
        }
        else if (componentId.startsWith('guess_button_')) {
            return res.send({
              type: InteractionResponseType.MODAL,
              data: {
                "title": "Hangman",
                "custom_id": "hangman",
                "components": [{
                  "type": 1,
                  "components": [{
                      "type": 4,
                      "custom_id": "guess",
                      "label": "Guess a letter",
                      "style": 1,
                      "min_length": 1,
                      "max_length": 4000,
                      "placeholder": "Type Here (use lowercase)",
                      "required": true
                    }]
                  }]
              },
            });
        }
        else if (componentId.startsWith('bug_button_')) {
          return res.send({
            type: InteractionResponseType.MODAL,
            data: {
              "title": "Report A Bug",
              "custom_id": "bug",
              "components": [{
                "type": 1,
                "components": [{
                    "type": 4,
                    "custom_id": "bugtext",
                    "label": "Your Bug Report:",
                    "style": 1,
                    "min_length": 1,
                    "max_length": 4000,
                    "placeholder": "Type Here",
                    "required": true
                  }]
                }]
            },
          });
        }
        else if (componentId.startsWith('report_button_')) {
          return res.send({
            type: InteractionResponseType.MODAL,
            data: {
              "title": "Report A User",
              "custom_id": "report",
              "components": [{
                "type": 1,
                "components": [
                  {
                    "type": 4,
                    "custom_id": "reportuser",
                    "label": "User ID:",
                    "style": 1,
                    "min_length": 1,
                    "max_length": 4000,
                    "placeholder": "Type Here",
                    "required": true,
                  }
                ],
              },
                  {
                  "type": 1,
                  "components": 
                  [
                    {
                      "type": 4,
                      "custom_id": "reporttext",
                      "label": "What did they do:",
                      "style": 1,
                      "min_length": 1,
                      "max_length": 4000,
                      "placeholder": "Type Here",
                      "required": true
                  }
                ]
                }]
            },
          });
        }

        else if (componentId.startsWith('invite_button_')) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'https://discord.com/oauth2/authorize?client_id=1356774445347242076',
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        });
      }
      else if (componentId.startsWith('commands_button_')) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '**Commands:**\n\`/help\` The help interface you\'re in now!\n\`/test\` The first command of our bot! Used to test if its working.\n\`/dadjoke\` Make the bot spit out a cringe worthy dad joke\n\`/yourabot\` Insult the bot brutally\n\`/say\` Make the bot say whatever you like\n\`/rps\` Play rock paper scissors! NOTE: THIS IS AN UNFINISHED COMMAND!\n\`/unshuffle\` The bot gives you an shuffled word, and you best unshuffle it!\n\`/robotcheck\` Check if someone is a robot\n\`/identify\` Get some info on a user ||note for the authorities: this info is a wee bit made up||\n\`/hangman\` Play a game of hangman! NOTE: THIS IS AN UNFINISHED COMMAND\n\`/fishingsimulator\` A mini fishing simulator that you can play**Message Commands:**\n\`quotify\` Quote a user\'s message!',
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        });
      }
      else if (componentId.startsWith('fish_button_')) {
        user_id = req.body.member?.user?.id || req.body.user?.id;
        if (commandRunner !== user_id) {
        return res.send({
            type: 4,
            data: {
                content: "This command isn\'t for you, sorry!",
                flags: InteractionResponseFlags.EPHEMERAL,
            }
        });
        }
        else {

        return res.send({
          type: InteractionResponseType.UPDATE_MESSAGE,
          data: {
             embeds: [
              {
                title: 'Fishing Simulator',
                description: 'Cast your rod to go fishing!',
                image: {url: 'https://cdn.discordapp.com/attachments/1228759006286319719/1371976752330444810/water-surface-animation-cartoon-seawater-ripple-of-water-video.jpg?ex=6825186b&is=6823c6eb&hm=87988bf3b084cea14157359ca87f4a29425bc8e83af216adda94b014f07e01d1&' },
                author: {name: 'Simple Minded'},
                color: 0xffffff
              }
            ],
             components: [
              {
                  type: MessageComponentTypes.ACTION_ROW,
                  components: [
                    {
                      type: MessageComponentTypes.BUTTON,
                      custom_id: `cast_button_${req.body.member.user.id}`,
                      label: 'Cast your rod',
                      style: ButtonStyleTypes.PRIMARY
                  },
                  {
                      type: MessageComponentTypes.BUTTON,
                      custom_id: `home_button_${req.body.member.user.id}`,
                      label: 'Homebase',
                      style: ButtonStyleTypes.PRIMARY
                  },
                  ],
              },
              ],
          },
        });
      }
    }
      else if (componentId.startsWith('cast_button_')) {
        user_id = req.body.member?.user?.id || req.body.user?.id;
        if (commandRunner !== user_id) {
        return res.send({
            type: 4,
            data: {
                content: "This command isn\'t for you, sorry!",
                flags: InteractionResponseFlags.EPHEMERAL,
            }
        });
        }
        else {
        return res.send({
          type: InteractionResponseType.UPDATE_MESSAGE,
          data: {
            embeds: [
              {
                title: 'Fishing Simulator',
                description: 'Your rod is cast. Wait for a fish!',
                image: {url: 'https://cdn.discordapp.com/attachments/1228759006286319719/1371977331618615426/Untitled_design_5.png?ex=682518f5&is=6823c775&hm=93d19c11994f21a5fe31e4e1330fff70b3d94dc19a06eea3bb0a2662fed7afcd&' },
                author: {name: 'Simple Minded'},
                color: 0xffffff
              }
            ],
             components: [
              {
                  type: MessageComponentTypes.ACTION_ROW,
                  components: [
                    {
                      type: MessageComponentTypes.BUTTON,
                      custom_id: `catch_button_${req.body.member.user.id}`,
                      label: 'Catch',
                      style: ButtonStyleTypes.PRIMARY
                  },
                  ],
              },
              ],
          },
        });
      }
    }
      else if (componentId.startsWith('catch_button_')) {
        user_id = req.body.member?.user?.id || req.body.user?.id;
        if (commandRunner !== user_id) {
        return res.send({
            type: 4,
            data: {
                content: "This command isn\'t for you, sorry!",
                flags: InteractionResponseFlags.EPHEMERAL,
            }
        });
        }
        else {
        return res.send({
          type: InteractionResponseType.UPDATE_MESSAGE,
          data: {
            embeds: [
              {
                title: 'Fishing Simulator',
                description: 'You caught a fish! This fish will be added to your inventory.',
                image: {url: 'https://cdn.discordapp.com/attachments/1228759006286319719/1371977711760834560/Fish_water.png?ex=68251950&is=6823c7d0&hm=4c06a30287c99ef0d00ad1c61271bc66a6e8ec3ce10b652f9a5b36a6fcd832e4&' },
                author: {name: 'Simple Minded'},
                color: 0xffffff
              }
            ],
             components: [
              {
                  type: MessageComponentTypes.ACTION_ROW,
                  components: [
                    {
                      type: MessageComponentTypes.BUTTON,
                      custom_id: `cast_button_${req.body.member.user.id}`,
                      label: 'Cast your rod again',
                      style: ButtonStyleTypes.PRIMARY
                  },
                  {
                      type: MessageComponentTypes.BUTTON,
                      custom_id: `home_button_${req.body.member.user.id}`,
                      label: 'Homebase',
                      style: ButtonStyleTypes.PRIMARY
                  },
                  ],
              },
              ],
          },
        });
      }
    }
    else if (componentId.startsWith('home_button_')) {
      user_id = req.body.member?.user?.id || req.body.user?.id;
      if (commandRunner !== user_id) {
      return res.send({
          type: 4,
          data: {
              content: "This command isn\'t for you, sorry!",
              flags: InteractionResponseFlags.EPHEMERAL,
          }
      });
      }
      else {
        return res.send ({
          type: InteractionResponseType.UPDATE_MESSAGE,
          data: {             
            embeds: [
              {
                title: 'Fishing Simulator',
                description: 'Your fishing simulator interface! Here is your homebase, where you can go fishing, sell your fish, view your inventory, upgrade your rod, or buy some lure! Have a reel good time and I hope your fishing experience goes swimmingly!',
                thumbnail: {url: 'https://cdn.discordapp.com/attachments/1228759006286319719/1371976011322884156/image-removebg-preview_7.png?ex=682517bb&is=6823c63b&hm=8bae8e219eeeb84f0c2613c4a73491345f4f4213b91392c968859d8f23b19d26&' },
                author: {name: 'Simple Minded'},
                color: 0xffffff
              }
            ],
           components: [
            {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                {
                    type: MessageComponentTypes.BUTTON,
                    // Append the game ID to use later on
                    custom_id: `fish_button_${req.body.member.user.id}`,
                    label: 'Go fishing',
                    style: ButtonStyleTypes.PRIMARY
                },
                {
                  type: MessageComponentTypes.BUTTON,
                  // Append the game ID to use later on
                  custom_id: `sell_button_${req.body.member.user.id}`,
                  label: 'Sell your fish',
                  style: ButtonStyleTypes.PRIMARY
              },
              {
                type: MessageComponentTypes.BUTTON,
                // Append the game ID to use later on
                custom_id: `inv_button_${req.body.member.user.id}`,
                label: 'Inventory',
                style: ButtonStyleTypes.PRIMARY
            },
            {
              type: MessageComponentTypes.BUTTON,
              // Append the game ID to use later on
              custom_id: `upgrade_button_${req.body.member.user.id}`,
              label: 'Upgrade rod',
              style: ButtonStyleTypes.PRIMARY
          },
            {
              type: MessageComponentTypes.BUTTON,
              // Append the game ID to use later on
              custom_id: `lure_button_${req.body.member.user.id}`,
              label: 'Buy lure',
              style: ButtonStyleTypes.PRIMARY
          },
                ],
            },
            ],
          },
      });
    }
  }
  else if (componentId.startsWith('sell_button_')) {
    user_id = req.body.member?.user?.id || req.body.user?.id;
    if (commandRunner !== user_id) {
    return res.send({
        type: 4,
        data: {
            content: "This command isn\'t for you, sorry!",
            flags: InteractionResponseFlags.EPHEMERAL,
        }
    });
    }
    else {
    return res.send({
      type: InteractionResponseType.UPDATE_MESSAGE,
      data: {
        embeds: [
          {
            title: 'Fishing Simulator',
            description: 'Here is Fisher Bob! Sell your fish to him!',
            image: {url: 'https://cdn.discordapp.com/attachments/1228759006286319719/1371981486441369701/Untitled_design_5.png?ex=68251cd4&is=6823cb54&hm=ba738108fe33af7e3c094266e02c84b8569589e22e6abff554b54ce1490618ea&' },
            author: {name: 'Simple Minded'},
            color: 0xffffff
          }
        ],
         components: [
          {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.BUTTON,
                  custom_id: `sellf_button_${req.body.member.user.id}`,
                  label: 'Sell your fish',
                  style: ButtonStyleTypes.PRIMARY
              },
              ],
          },
          {
            type: MessageComponentTypes.BUTTON,
            custom_id: `home_button_${req.body.member.user.id}`,
            label: 'Homebase',
            style: ButtonStyleTypes.PRIMARY
        },
          ],
      },
    });
  }
}
else if (componentId.startsWith('sellf_button_')) {
  user_id = req.body.member?.user?.id || req.body.user?.id;
  if (commandRunner !== user_id) {
  return res.send({
      type: 4,
      data: {
          content: "This command isn\'t for you, sorry!",
          flags: InteractionResponseFlags.EPHEMERAL,
      }
  });
  }
  else {
  return res.send({
    type: InteractionResponseType.UPDATE_MESSAGE,
    data: {
      embeds: [
        {
          title: 'Fishing Simulator',
          description: 'Thanks for selling your fish! Fisher Bob thanks you.',
          image: {url: 'https://cdn.discordapp.com/attachments/1228759006286319719/1371977331618615426/Untitled_design_5.png?ex=682518f5&is=6823c775&hm=93d19c11994f21a5fe31e4e1330fff70b3d94dc19a06eea3bb0a2662fed7afcd&' },
          author: {name: 'Simple Minded'},
          color: 0xffffff
        }
      ],
       components: [
        {
          type: MessageComponentTypes.BUTTON,
          custom_id: `home_button_${req.body.member.user.id}`,
          label: 'Homebase',
          style: ButtonStyleTypes.PRIMARY
      },
        ],
    },
  });
}
}
        return;
      }


  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" command
    if (name === 'test') {
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: `Never fear, I am here!`,
        },
      });
    }

    if (name === 'dadjoke') {
  const joke = dadJokes[Math.floor(Math.random() * dadJokes.length)];
  return res.send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: joke,
    },
  });
}

        if (name === 'yourabot') {
            return res.send ({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {             
               content: `Im a REAL human being! Never say such insults again!`,
            },
        });
      }

        if (name === 'say' &&id) {
          user_id = req.body.member?.user?.id || req.body.user?.id;          
          return res.send({
            type: InteractionResponseType.MODAL,
            data: {
            "title": "Message",
            "custom_id": "message",
            "components": [{
              "type": 1,
              "components": [{
                  "type": 4,
                  "custom_id": "text",
                  "label": "Text",
                  "style": 1,
                  "min_length": 1,
                  "max_length": 4000,
                  "placeholder": "Type Here",
                  "required": true
                }]
              }]
              },
              allowedMentions: { parse: ["users"] }
          });
        }

    if (name === 'rps' &&id) {
      player = 0
      MentionedUserID = req.body.data.options[0].value
      user_id = req.body.member?.user?.id || req.body.user?.id;
      if (activeRPSPlayers.has(user_id)) {
        return res.send({
          type: 4,
          data: {
            content: 'This user is already in a game! Sorry! ._.',
            flags: 64
          }
        });
      }
      activeRPSPlayers.add(MentionedUserID);
      activeRPSPlayers.add(user_id);
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // content
          content: `<@${user_id}> CHALLENGES <@${MentionedUserID}> TO ROCK PAPER SCISSORS!!!`,
                  components: [
        {
            type: MessageComponentTypes.ACTION_ROW,
            components: [
            {
                type: MessageComponentTypes.BUTTON,
                // Append the game ID to use later on
                custom_id: `choose_button_${req.body.id}`,
                label: 'Choose your option!',
                style: ButtonStyleTypes.PRIMARY
            },
            ],
        },
        ],
          },
      });
    }

    if (name === 'unshuffle' &&id) {
      user_id = req.body.member?.user?.id || req.body.user?.id;
      const words = ["simple", "minded", "calender", "tiger", "animal", "maple", "underwear", "keyboard", "doorframe", "planets", "medieval", "clockwork",
        "echo", "marble", "banana", "shuffle", "orbit", "plasma", "lamp", "pencil", "wizard", "cactus",
  "moisture", "breeze", "goblin", "pickle", "dizzy", "cobweb", "ribbon", "noodle", "snack", "juggle",
  "pebble", "mango", "turquoise", "robot", "whistle", "cabbage", "tunnel", "gravy", "slippery", "marsh",
  "quack", "plush", "sneeze", "bubble", "velcro", "sprinkle", "garage", "wiggle", "pajamas", "sock",
  "nugget", "kazoo", "backpack", "glitter", "sprout", "biscuit", "button", "snorkel", "cupcake", "jigsaw",
  "banjo", "scooter", "gnome", "shampoo", "wig", "elbow", "grumble", "jungle", "pogo", "yo-yo",
  "waffle", "canoe", "doodle", "fudge", "ping", "zipper", "squeak", "booger", "twinkle", "syrup",
  "nuzzle", "raspberry", "thunder", "coconut", "hammock", "igloo", "meadow", "toasty", "clam", "breeze",
  "gadget", "waffle", "cheddar", "trombone", "gumdrop", "tornado", "blanket", "compass", "dragon", "kettle"
]
      function shuffleWord(word) {
        return word.split("").sort(() => Math.random() - 0.5).join("");
      }
      const chosenWord = words[Math.floor(Math.random() * words.length)];
      const shuffled = shuffleWord(chosenWord);

      activeGames[req.body.member.user.id] = chosenWord;
      const userId = req.body.member.user.id;
      const username = req.body.member.user.username;
      timeLimit = req.body.data.options[0].value

    timestamp = Date.now()
    
      return res.send({
        type: InteractionResponseType.MODAL,
        data: {
            "title": "Unshuffle",
            "custom_id": "unshuffle",
            "components": [{
              "type": 1,
              "components": [{
                  "type": 4,
                  "custom_id": "Unshuffled word",
                  "label": `Unshuffle this word: ${shuffled}`,
                  "style": 1,
                  "min_length": 1,
                  "max_length": 4000,
                  "placeholder": "Type Here (use lowercase)",
                  "required": true
                }]
              }]
        }
      
    });
    }


    if (name === 'robotcheck') {
    const MentionedUserID = req.body.data.options[0].value
    const RandomNumber = Math.trunc(Math.random ()*100)
    if (RandomNumber>=50) {
      return res.send ({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {             
           content: `🤖 Hmm... <@${MentionedUserID}> is ${RandomNumber}% robot! You **are** a robot! 🤖`,
        },
    });
    }
    else {
      return res.send ({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {             
           content: `🤖 Hmm... <@${MentionedUserID}> is ${RandomNumber}% robot! You are **not** a robot! 🤖`,
        },
    });
    }
    }

    if (name === 'quotify' &&id) {
      const fullDate = new Date()
      const formattedDate = fullDate.toDateString().split(' ').slice(1).join(' ')
      const fullMessage = Object.values(data.resolved.messages)[0]
      const messageContent = fullMessage.content
      const quoteUserID = fullMessage.author.id
      user_id = req.body.member?.user?.id || req.body.user?.id;
      return res.send ({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {             
           content: `"${messageContent}"\n- <@${quoteUserID}>, ${formattedDate}`,
        },
    });
      }

    if (name === 'identify') {
      const MentionedUserID = req.body.data.options[0].value
    const RandomNumber = Math.trunc(Math.random ()*100)
    const species = [
      "dog", "cat", "elephant", "lion", "tiger", "cheetah", "leopard", "bear", "panda", "giraffe", "kangaroo", "koala",
      "zebra", "hippopotamus", "rhinoceros", "bat", "sloth", "otter", "fox", "wolf", "moose", "deer", "bison", "buffalo",
      "whale", "dolphin", "porpoise", "hedgehog", "armadillo", "platypus",
    
      "eagle", "hawk", "falcon", "owl", "pigeon", "dove", "parrot", "macaw", "cockatoo", "crow", "raven", "robin", "sparrow",
      "penguin", "ostrich", "emu", "turkey", "duck", "goose", "swan", "peacock", "canary", "flamingo", "woodpecker", "hummingbird",
    
      "snake", "python", "cobra", "rattlesnake", "boa", "lizard", "chameleon", "iguana", "gecko", "komodo dragon", "crocodile",
      "alligator", "tortoise", "turtle",
    
      "frog", "toad", "salamander", "newt", "axolotl",
    
      "shark", "goldfish", "clownfish", "salmon", "trout", "bass", "pike", "catfish", "eel", "guppy", "anglerfish", "barracuda",
      "mackerel", "tuna", "stingray", "seahorse",
    
      "ant", "bee", "wasp", "hornet", "butterfly", "moth", "beetle", "ladybug", "grasshopper", "cricket", "dragonfly", "mosquito",
      "fly", "spider", "scorpion", "tick", "flea",
    
      "octopus", "squid", "jellyfish", "crab", "lobster", "shrimp", "clam", "oyster", "starfish", "sea urchin", "anemone",
    
      "cow", "pig", "goat", "sheep", "chicken", "rooster", "horse", "donkey", "mule", "llama", "alpaca",
    
      "unicorn", "dragon", "gryphon", "phoenix", "cerberus", "minotaur", "yeti", "sasquatch", "mermaid", "kraken"
    ]
    function getRandomAnimal() {
      const randomIndex = Math.floor(Math.random() * species.length);
      return species[randomIndex];
    }
    const Wisdom = Math.trunc(Math.random ()*10)
    const Credibility = Math.trunc(Math.random ()*100)
    const Humour = Math.trunc(Math.random ()*10)
      return res.send ({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {             
           content: `## Identify:\n**User:** <@${MentionedUserID}>\n**Species:** ${getRandomAnimal ()}\n**Wisdom Level:** ${Wisdom}/10\n**Credibility:** ${Credibility}%\n**Status:** Single, like everyone on Discord\n**Humour Level:** ${Humour}/10`,
        },
    });
    }

  if (name === 'hangman' &&id) {
    wrongGuessLetters = []
    wrongGuesses = 0
    user_id = req.body.member?.user?.id || req.body.user?.id;
    const hLevel = req.body.data.options[0].value
    function GetRandomSWord() {
      const randomSWord = Math.floor(Math.random() * shortWords.length);
      return shortWords[randomSWord];
    }
    
    function splitSWord(randomSWord) {
      return randomSWord.split("")
    }
    function GetRandomWWord() {
      const randomWWord = Math.floor(Math.random() * mediumWords.length);
      return mediumWords[randomWWord];
    }

    function splitMWord(randomSWord) {
      return randomSWord.split("")
    }

    function GetRandomLWord() {
      const randomLWord = Math.floor(Math.random() * longWords.length);
      return longWords[randomLWord];
    }

    function splitLWord(randomSWord) {
      return randomSWord.split("")
    }

    const shortWords = [
      "echo", "lamp", "sock", "ping", "clam", "pogo", "wig", "zip", "jig", "buzz", "grit", "your", "gnat", "duck", "kite",
      "frog", "toad", "nest", "leaf", "bark", "milk", "glow", "drip", "flip", "trap", "snap", "quiz", "fizz", "kick", "jump",
      "moss", "hive", "lava", "mist", "loop", "plug", "twit", "peep", "drop", "dart"
    ];
    const mediumWords = [
      "banana", "pickle", "tunnel", "juggle", "ribbon", "marble", "rocket", "kazoo", "scooter", "breeze", "cactus", "sprout",
      "nugget", "gadget", "garage", "button", "glitter", "noodle", "wiggle", "pajamas", "mango", "jigsaw", "sneeze", "turtle",
      "unicorn", "waffle", "fiddle", "pillow", "puzzle", "stream", "trophy", "bottle", "snappy", "dragon", "cookie", "snorky",
      "muddle", "goblin", "muffin", "gadget", "sponge", "velcro", "marzipan", "sherbet"
    ];
    const longWords = [
      "cupcake", "blanket", "dinosaur", "tornado", "moisture", "snorkel", "coconut", "shampoo", "sprinkle", "marshmallow",
      "cheddar", "grumbles", "slippery", "compass", "twinkling", "thunderous", "backpacks", "waffleiron", "hammock",
      "dragonfly", "whirlwind", "waterfall", "electric", "snowflake", "bubblegum", "spaceship", "peppermint", "mysterious",
      "nightmare", "candlestick", "daydreamer", "moonlight", "caterpillar", "sunflower", "underwater", "pineapples"
    ];
    hangmanStages = [
      " +---+\n |   |\n     |\n     |\n     |\n     |\n=========",
      " +---+\n |   |\n O   |\n     |\n     |\n     |\n=========",
      " +---+\n |   |\n O   |\n |   |\n     |\n     |\n=========",
      " +---+\n |   |\n O   |\n/|   |\n     |\n     |\n=========",
      " +---+\n |   |\n O   |\n/|\\  |\n     |\n     |\n=========",
      " +---+\n |   |\n O   |\n/|\\  |\n/    |\n     |\n=========",
      " +---+\n |   |\n O   |\n/|\\  |\n/ \\  |\n     |\n========="
    ];
    if (hLevel === 1) {

    const randomSWord = GetRandomSWord();
    const wordLength = randomSWord.length
    underScores = "_".repeat(wordLength).trim();
    splitLetters = splitSWord(randomSWord);
    console.log("Split word:", splitLetters);


    return res.send ({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {             
         content: `\`\`\`Hangman:\n${hangmanStages[wrongGuesses]}\nWord:\n\`${underScores.replaceAll("_","_ ")}\`\nWrong Guesses:\n${wrongGuessLetters}\nREMEMBER, IN YOUR GUESSES USE ONLY LOWERCASE LETTERS\`\`\``,
         components: [
          {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
              {
                  type: MessageComponentTypes.BUTTON,
                  // Append the game ID to use later on
                  custom_id: `guess_button_${req.body.id}`,
                  label: 'Guess',
                  style: ButtonStyleTypes.PRIMARY
              },
              ],
          },
          ],
      },
  });
  }
  if (hLevel === 2) {

    const randomWWord = GetRandomWWord();
    const wordLength = randomWWord.length
    underScores = "_".repeat(wordLength).trim();
    splitLetters = splitMWord(randomWWord);
    console.log("Split word:", splitLetters);


    return res.send ({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {             
         content: `\`\`\`Hangman:\n${hangmanStages[wrongGuesses]}\nWord:\n\`${underScores.replaceAll("_","_ ")}\`\nWrong Guesses:\n${wrongGuessLetters}\nREMEMBER, IN YOUR GUESSES USE ONLY LOWERCASE LETTERS\`\`\``,
         components: [
          {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
              {
                  type: MessageComponentTypes.BUTTON,
                  // Append the game ID to use later on
                  custom_id: `guess_button_${req.body.id}`,
                  label: 'Guess',
                  style: ButtonStyleTypes.PRIMARY
              },
              ],
          },
          ],
      },
  });
  }
  if (hLevel === 3) {

    const randomLWord = GetRandomLWord();
    const wordLength = randomLWord.length
    underScores = "_".repeat(wordLength).trim();
    splitLetters = splitLWord(randomLWord);
    console.log("Split word:", splitLetters);


    return res.send ({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {             
         content: `\`\`\`Hangman:\n${hangmanStages[wrongGuesses]}\nWord:\n\`${underScores.replaceAll("_","_ ")}\`\nWrong Guesses:\n${wrongGuessLetters}\nREMEMBER, IN YOUR GUESSES USE ONLY LOWERCASE LETTERS\`\`\``,
         components: [
          {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
              {
                  type: MessageComponentTypes.BUTTON,
                  // Append the game ID to use later on
                  custom_id: `guess_button_${req.body.id}`,
                  label: 'Guess',
                  style: ButtonStyleTypes.PRIMARY
              },
              ],
          },
          ],
      },
  });
  }
}

if (name === 'help') {
  return res.send ({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE ,
    data: {             
       content: `**Simple Minded Help Page:**\nUse this command to view our commands, contact support, report a bug, or invite the bot to your server!\n**Bot info:**\nThis bot, Simple Minded, was made by evilduckperson using JavaScript, however not Discord.js. We are an entirely games focused bot and keep making and improving games for your enjoyment. Please give us a try and keep an open mind, as we are always improving. Thanks!`,
       components: [
        {
            type: MessageComponentTypes.ACTION_ROW,
            components: [
            {
                type: MessageComponentTypes.BUTTON,
                // Append the game ID to use later on
                custom_id: `bug_button_${req.body.id}`,
                label: 'Submit a bug',
                style: ButtonStyleTypes.PRIMARY
            },
            {
              type: MessageComponentTypes.BUTTON,
              // Append the game ID to use later on
              custom_id: `report_button_${req.body.id}`,
              label: 'Submit a user report',
              style: ButtonStyleTypes.PRIMARY
          },
          {
            type: MessageComponentTypes.BUTTON,
            // Append the game ID to use later on
            custom_id: `invite_button_${req.body.id}`,
            label: 'Invite me to your server',
            style: ButtonStyleTypes.PRIMARY
        },
        {
          type: MessageComponentTypes.BUTTON,
          // Append the game ID to use later on
          custom_id: `commands_button_${req.body.id}`,
          label: 'View all my commands',
          style: ButtonStyleTypes.PRIMARY
      },
            ],
        },
        ],
    },
});
}

if (name === 'fishingsimulator' &&id) {
  user_id = req.body.member?.user?.id || req.body.user?.id;
  commandRunner = user_id
  return res.send ({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE ,
    data: {             
        embeds: [
          {
            title: 'Fishing Simulator',
            description: 'Your fishing simulator interface! Here is your homebase, where you can go fishing, sell your fish, view your inventory, upgrade your rod, or buy some lure! Have a reel good time and I hope your fishing experience goes swimmingly!',
            thumbnail: {url: 'https://cdn.discordapp.com/attachments/1228759006286319719/1371976011322884156/image-removebg-preview_7.png?ex=682517bb&is=6823c63b&hm=8bae8e219eeeb84f0c2613c4a73491345f4f4213b91392c968859d8f23b19d26&' },
            author: {name: 'Simple Minded'},
            color: 0xffffff
          }
        ],
       components: [
        {
            type: MessageComponentTypes.ACTION_ROW,
            components: [
            {
                type: MessageComponentTypes.BUTTON,
                // Append the game ID to use later on
                custom_id: `fish_button_${req.body.member.user.id}`,
                label: 'Go fishing',
                style: ButtonStyleTypes.PRIMARY
            },
            {
              type: MessageComponentTypes.BUTTON,
              // Append the game ID to use later on
              custom_id: `sell_button_${req.body.member.user.id}`,
              label: 'Sell your fish',
              style: ButtonStyleTypes.PRIMARY
          },
          {
            type: MessageComponentTypes.BUTTON,
            // Append the game ID to use later on
            custom_id: `inv_button_${req.body.member.user.id}`,
            label: 'Inventory',
            style: ButtonStyleTypes.PRIMARY
        },
        {
          type: MessageComponentTypes.BUTTON,
          // Append the game ID to use later on
          custom_id: `upgrade_button_${req.body.member.user.id}`,
          label: 'Upgrade rod',
          style: ButtonStyleTypes.PRIMARY
      },
        {
          type: MessageComponentTypes.BUTTON,
          // Append the game ID to use later on
          custom_id: `lure_button_${req.body.member.user.id}`,
          label: 'Buy lure',
          style: ButtonStyleTypes.PRIMARY
      },
            ],
        },
        ],
    },
});
}
  



    console.error(`unknown command: ${name}`);
    return res.status(400).json({ error: 'unknown command' });

    console.error('unknown interaction type', type);
    return res.status(400).json({ error: 'unknown interaction type' });
}});


app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});



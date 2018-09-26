$(function() {
  // Focus on load
  $('.typeHere').focus();
  // Force focus
  $('.typeHere').focusout(function(){
      $('.typeHere').focus();
  });
  
  $('[data-toggle="popover"]').popover();
});

angular.module('typerApp', [])
  .controller('TyperController', function($http, $scope, $timeout, $interval) {
    var typer = this;  
    var currentVersion = 2.6; 
    

    typer.data = {};
    

    
    typer.shuffleArray = function (array) {
      var ctr = array.length, temp, index;
  
      // While there are elements in the array
        while (ctr > 0) {
      // Pick a random index
        index = Math.floor(Math.random() * ctr);
      // Decrease ctr by 1
        ctr--;
      // And swap the last element with it
        temp = array[ctr];
        array[ctr] = array[index];
        array[index] = temp;
      }
      return array;
  }

    typer.getUpgradeCashBonus = function() {
      return typer.data.upgrades.filter(upg => upg.code == "cash")[0].purchased;
    };
    typer.getUpgradeSpaces = function() {
      return typer.data.upgrades.filter(upg => upg.code == "space")[0].purchased;
    };
    typer.getUpgradeVowels = function() {
      return typer.data.upgrades.filter(upg => upg.code == "vowel")[0].purchased;
    };
    typer.getUpgradeLuck = function() {
      return typer.data.upgrades.filter(upg => upg.code == "luck")[0].purchased;
    }
    typer.getUpgradeConsonants = function() {
      return typer.data.upgrades.filter(upg => upg.code == "consonant")[0].purchased;
    };
    typer.getAllowedTypos = function() {
      return typer.data.upgrades.filter(upg => upg.code == "typo")[0].purchased;
    };
    typer.getUpgradeSpeed = function() {
      return typer.data.upgrades.filter(upg => upg.code == "speed")[0].purchased;
    };
    typer.getUpgradeStreak = function() {
      return typer.data.upgrades.filter(upg => upg.code == "streak")[0].purchased;
    }

    typer.showDeleteModal = function() {
      $('#deleteModal').modal('show');
    }
    typer.showModal = function() {      
      $('#btnSpace').popover('hide')
      $('#btnLuck').popover('hide')
      $('#btnKeyboard').popover('hide')
      $('#winModal').modal('show');
      $('[data-toggle="popover"]').popover();
    };

    typer.modalPageBack = function() {
      typer.data.modalPage = typer.data.modalPage - 1;
      $('[data-toggle="popover"]').popover();
      typer.save();
    };
    typer.modalPageNext = function() {
      typer.data.modalPage = typer.data.modalPage + 1;
      $('[data-toggle="popover"]').popover();
      typer.save();
    };

    typer.saveAllWords = function() {
      typer.data.words.forEach(element => {
        if (!typer.data.allWords) {
          typer.data.allWords = [element];
        } else {
          var allWord = typer.data.allWords.filter(el => el.word == element.word);
          if (allWord.length == 0) {
            //insert
            typer.data.allWords.push(element);
          } else {
            //update
            allWord[0].typeCount += element.typeCount;
            allWord[0].mistypeCount += element.mistypeCount;
          }
        }
      });
    };    
    typer.applyUpgrades = function() {
      //apply upgrades  
      //vowel
      //get locked vowels
      var lockedVowels = typer.data.vowels.filter(letter => !typer.data.unlockedLetters.includes(letter)).slice(0);
      var randomVowels = typer.shuffleArray(lockedVowels);
      for (i = 0; i < typer.getUpgradeVowels(); i++) {
        //get random, locked vowel
        var vowel = randomVowels[i];
        //add to unlocked
        typer.data.unlockedLetters.push(vowel.trim());
        //increment unlockedVowels
        typer.data.unlockedVowels++;
        //handle pricing somehow TODO
      }

      //consonant
      //get locked consonants
      var lockedConsonants = typer.data.consonants.filter(letter => !typer.data.unlockedLetters.includes(letter)).slice(0);
      var randomConsonants = typer.shuffleArray(lockedConsonants);
      for (i = 0; i < typer.getUpgradeConsonants(); i++) {
        //get random, locked consonant
        var consonant = randomConsonants[i];
        //add to unlocked
        typer.data.unlockedLetters.push(consonant.trim());
        //increment unlockedConsonants
        typer.data.unlockedConsonants++;
        //handle pricing somehow TODO
      }
      
    };

    typer.loadWords = function() {

      typer.saveAllWords();

      $http.get("words/1000/" + typer.data.currentList.code + ".txt").then(function success(response) {      
        typer.data.wordData = response.data.split("\n"[0]);
  
        typer.data.words = [];
        typer.data.wordData.forEach(function(element) {
          if (element.length > 0) {
            typer.data.words.push({
              word:element.split(",")[0].trim(),
              length:element.split(",")[0].trim().length,
              typeCount:0,
              mistypeCount:0,
              color: (typer.data.currentList.code == "color" ? element.split(",")[1] : null)
            });
          }        
        });

        typer.setMinumumUnlocks();
        typer.applyUpgrades();
        typer.getNewWord();    

        typer.save();    
  
      }, function error(response) {
        debugger;
      });
    }
    typer.load = function() {
      var data = localStorage.getItem('TypingSave');
      var parsed = JSON.parse(data);      
      typer.data = parsed;
      typer.data.timeLoaded = Date.now();
      
      

      
      if (!typer.data.version || typer.data.version < 2) {
        return; //delete save for < 2.0
      }
        //Updates go here.
        if (typer.data.version < 2.1) {
          //2.1 updates go here
          typer.data.lists.filter(list => list.code == "gutenberg1")[0].description = "The 1,000 most frequent words in the 57,000 free e-Book library of Project Gutenberg. Unlocks the next Gutenberg list on completion.";
          //also need to be added to new game section
        }
        if (typer.data.version < 2.2) {
          //2.2 updates go here
          typer.data.lists.filter(list => list.code == "gutenberg1")[0].description = "The 1,000 most frequent words in the 57,000 free eBook library of Project Gutenberg. Unlocks the next Gutenberg list on completion.";
          //also need to be added to new game section
        }
        if (typer.data.version < 2.3) {
          typer.data.upgrades.filter(upg => upg.code == "luck")[0].description = "Increases the chance of getting a word you've never typed correctly.";
        }
        if (typer.data.version < 2.4) {
          //fix apostrophe ’
          typer.data.words.forEach(word => {
            if (word.word.startsWith("Big dip o")) {
              word.word = "Big dip o'ruby";
            }
          });
        }
        if (typer.data.version < 2.5) {
          //fix ü
          typer.data.words.forEach(word => {
            if (word.word == "München") {
              word.word = "Marietta"
            }
          });
          typer.data.words.forEach(word => {
            if (word.word == "here]'s") {
              word.word = "here's";
            }
          });

        }
        if (typer.data.version < 2.6) { //2.6          
          typer.data.maxWPM = 100;
          typer.data.maxStreak = 100;
          typer.data.maxStreakBonus = 5;
          typer.data.maxSpeedBonus = 5;
          typer.data.upgrades.push(
            {
              //MaxSpeed
              code: "speed",
              name: "Max Speed",
              description: "Increases the maximum WPM multiplier you can earn.",
              baseCost: 1,
              costMultiplier: 1.3,
              purchased: 0,
              maxPurchases: 95,
            }, {
              //MaxStreak
              code: "streak",
              name: "Max Streak",
              description: "Increases the maximum streak multiplier you can earn.",
              baseCost: 1,
              costMultiplier: 1.3,
              purchased: 0,
              maxPurchases: 95,
            });
        }

        //Check for dupe upgrades
        typer.data.upgrades = typer.data.upgrades.filter((obj, pos, arr) => {
          return arr.map(mapObj => mapObj["code"]).indexOf(obj["code"]) === pos;
        });
        
        typer.save();

      if (typer.data.words.length == 0) {
        typer.loadWords();
      } else {
        typer.getNewWord();
      }      

      if (typer.data.listCompleted) {         
        typer.showModal();
      }
          
    };

    typer.save = function() {
      var save = {};

      save.currentList = typer.data.currentList;
      save.words = typer.data.words;
      save.money = typer.data.money;

      save.prestigePoints = typer.data.prestigePoints;

      save.unlockedLetters = typer.data.unlockedLetters;
      save.unlockedVowels = typer.data.unlockedVowels;
      save.unlockedConsonants = typer.data.unlockedConsonants;
      
      save.spacePurchased = typer.data.spacePurchased;
      save.luckPurchased = typer.data.luckPurchased;
      save.keyboardPurchased = typer.data.keyboardPurchased;

      save.highestStreak = typer.data.highestStreak;
      save.highestWPM = typer.data.highestWPM;

      save.lists = typer.data.lists;
      save.upgrades = typer.data.upgrades;
      save.allWords = typer.data.allWords;

      save.listCompleted = typer.data.listCompleted;
      save.listsCompleted = typer.data.listsCompleted;

      typer.data.timePlayed += (Date.now() - typer.data.timeLoaded) / 1000;
      save.timePlayed = typer.data.timePlayed;
      typer.data.timeLoaded = Date.now();

      save.maxStreak = typer.data.maxStreak;    
      save.maxWPM = typer.data.maxWPM;

      save.maxStreakBonus = typer.data.maxStreakBonus;
      save.maxSpeedBonus = typer.data.maxSpeedBonus;
      
      save.version = currentVersion;

      localStorage.setItem('TypingSave', JSON.stringify(save));
    }
    

    typer.getUnlockedWords = function() {
      var filtered = typer.data.words.filter(function(word) {
        var unlocked = true;    

        if (word.length <= typer.data.spacePurchased + typer.getUpgradeSpaces()) {
          var chars = word.word.split('');

          chars.forEach(function(char) {
            if (!typer.data.unlockedLetters.includes(char.toUpperCase())) {
              unlocked = false;
            }
          });

        } else {
          unlocked = false;
        }
        return unlocked;
      });

      return filtered;
    };

    typer.getNewWord = function() { 
      var filtered = typer.getUnlockedWords()

      if (filtered.length == 0) {
        alert('someting broke');
        return;        
      }

      var filteredNew = filtered.filter(word => word.typeCount == 0);
      
      var luck = Math.floor(Math.random() * 101); //1-100
      var playerLuck = typer.data.luckPurchased + typer.getUpgradeLuck();

      if (luck < playerLuck && filteredNew.length > 0) { //if luck is under player luck
        var newWord = filteredNew[Math.floor(Math.random() * filteredNew.length)];
      } else {
        var newWord = filtered[Math.floor(Math.random() * filtered.length)];
      }

      //move lastword
      //move currentword      
      typer.data.lastWord = typer.data.currentWord;
      //move nextWord      
      typer.data.currentWord = typer.data.nextWord;
      //get new word
      typer.data.nextWord = newWord;

      if (!typer.data.currentWord) {
        typer.getNewWord();
      }
            
      typer.typos = 0;
      typer.hasTypo = false;
    };
    
    if (localStorage.TypingSave) {
      typer.load();
    } 

    if (!localStorage.TypingSave || !typer.data.version) {
      typer.data.words = [];
      typer.data.money = 0;
      typer.data.unlockedVowels = 1;
      typer.data.unlockedConsonants = 0;
      typer.data.unlockedLetters = [];

      typer.data.prestigePoints = 0;
      
      typer.data.spacePurchased = 1;
      typer.data.luckPurchased = 0;
      typer.data.keyboardPurchased = 1;

      typer.data.timePlayed = 0; //seconds
      typer.data.timeLoaded = Date.now();
      typer.data.highestStreak = 0;
      typer.data.highestWPM = 0;

      typer.data.lists = [{
        name: "Gutenberg 1 - 1,000",
        code: "gutenberg1", //filename
        description: "The 1,000 most frequent words in the 57,000 free eBook library of Project Gutenberg. Unlocks the next Gutenberg list on completion.",
        completed: 0,
        lastTimeTaken: 0,
        difficulty: 1,
        pointsOnCompletion: 5,
        unlocked: true,
      },{
        name: "Gutenberg 1,001 - 2,000",
        code: "gutenberg2",
        description: "Words 1,001 - 2,000 of the most frequent in the 57,000 free eBook library of Project Gutenberg. Unlocks the next Gutenberg list on completion.",
        completed: 0,
        lastTimeTaken: 0,
        difficulty: 1,
        pointsOnCompletion: 5,
        unlocked: false,
      },{
        name: "Gutenberg 2,001 - 3,000",
        code: "gutenberg3",
        description: "Words 2,001 - 3,000 of the most frequent in the 57,000 free eBook library of Project Gutenberg. Unlocks the next Gutenberg list on completion.",
        completed: 0,
        lastTimeTaken: 0,
        difficulty: 1,
        pointsOnCompletion: 5,
        unlocked: false,
      },{
        name: "Gutenberg 3,001 - 4,000",
        code: "gutenberg4",
        description: "Words 3,001 - 4,000 of the most frequent in the 57,000 free eBook library of Project Gutenberg. Unlocks the next Gutenberg list on completion.",
        completed: 0,
        lastTimeTaken: 0,
        difficulty: 1,
        pointsOnCompletion: 5,
        unlocked: false,
      },{
        name: "Gutenberg 4,001 - 5,000",
        code: "gutenberg5",
        description: "Words 4,001 - 5,000 of the most frequent in the 57,000 free eBook library of Project Gutenberg. Unlocks the next Gutenberg list on completion.",
        completed: 0,
        lastTimeTaken: 0,
        difficulty: 2,
        pointsOnCompletion: 5,
        unlocked: false,
      },{
        name: "Gutenberg 5,001 - 6,000",
        code: "gutenberg6",
        description: "Words 5,001 - 6,000 of the most frequent in the 57,000 free eBook library of Project Gutenberg. Unlocks the next Gutenberg list on completion.",
        completed: 0,
        lastTimeTaken: 0,
        difficulty: 2,
        pointsOnCompletion: 5,
        unlocked: false,
      },{
        name: "Gutenberg 6,001 - 7,000",
        code: "gutenberg7",
        description: "Words 6,001 - 7,000 of the most frequent in the 57,000 free eBook library of Project Gutenberg. Unlocks the next Gutenberg list on completion.",
        completed: 0,
        lastTimeTaken: 0,
        difficulty: 2,
        pointsOnCompletion: 5,
        unlocked: false,
      },{
        name: "Gutenberg 7,001 - 8,000",
        code: "gutenberg8",
        description: "Words 7,001 - 8,000 of the most frequent in the 57,000 free eBook library of Project Gutenberg. Unlocks the next Gutenberg list on completion.",
        completed: 0,
        lastTimeTaken: 0,
        difficulty: 3,
        pointsOnCompletion: 5,
        unlocked: false,
      },{
        name: "Gutenberg 8,001 - 9,000",
        code: "gutenberg9",
        description: "Words 8,001 - 9,000 of the most frequent in the 57,000 free eBook library of Project Gutenberg. Unlocks the next Gutenberg list on completion.",
        completed: 0,
        lastTimeTaken: 0,
        difficulty: 3,
        pointsOnCompletion: 5,
        unlocked: false,
      },{
        name: "Gutenberg 9,001 - 10,000",
        code: "gutenberg10",
        description: "Words 9,001 - 10,000 of the most frequent in the 57,000 free eBook library of Project Gutenberg.",
        completed: 0,
        lastTimeTaken: 0,
        difficulty: 3,
        pointsOnCompletion: 5,
        unlocked: false,
      },{
        name: "World Geography",
        code: "geography",
        description: "Do words like Kyrgyzstan or N'Djamena scare you off? Not for the feint of heart.",
        completed: 0,
        lastTimeTaken: 0,
        difficulty: 5,
        pointsOnCompletion: 10,
        unlocked: true,
      },{
        name: "Colors",
        code: "color",
        description: "Who knew there were over 1,000 different named colors??",
        completed: 0,
        lastTimeTaken: 0,
        difficulty: 3,
        pointsOnCompletion: 8,
        unlocked: true,
      }]

      typer.data.upgrades = [{
        //typo forgiveness
        code: "typo",
        name: "Typo Forgiveness",
        description: "Allows an additional typo per word.",
        baseCost: 5,
        costMultiplier: 1.2,
        purchased: 0,
        maxPurchases: 20,
      },{
        //starting spaces
        code: "space",
        name: "Starting Space",
        description: "Start each list with an additional space.",
        baseCost: 1,
        costMultiplier: 1.3,
        purchased: 0,
        maxPurchases: 100,
      },{
        //starting vowels
        code: "vowel",
        name: "Starting Vowel",
        description: "Start each list with an additional, random, vowel.",
        baseCost: 1,
        costMultiplier: 2,
        purchased: 0,
        maxPurchases: 5,
      },{
        //starting consonants
        code: "consonant",
        name: "Starting Consonant",
        description: "Start each list with an additional, random, consonant.",
        baseCost: 1,
        costMultiplier: 1.2,
        purchased: 0,
        maxPurchases: 20,
      },{
        //cash +
        code: "cash",
        name: "Bonus Money",
        description: "Grants additional money for each word typed.",
        baseCost: 1,
        costMultiplier: 1.1,
        purchased: 0,
        maxPurchases: 100,
      },{
        //luck +
        code: "luck",
        name: "Starting Luck",
        description: "Increases the chance of getting a word you've never typed correctly.",
        baseCost: 1,
        costMultiplier: 1.1,
        purchased: 0,
        maxPurchases: 100,
      }, {
        //MaxSpeed
        code: "speed",
        name: "Max Speed",
        description: "Increases the maximum WPM multiplier you can earn.",
        baseCost: 1,
        costMultiplier: 1.3,
        purchased: 0,
        maxPurchases: 95,
      }, {
        //MaxStreak
        code: "streak",
        name: "Max Streak",
        description: "Increases the maximum streak multiplier you can earn.",
        baseCost: 1,
        costMultiplier: 1.3,
        purchased: 0,
        maxPurchases: 95,
      }];

      
      typer.data.currentList = typer.data.lists[0];
      typer.data.listCompleted = false;
      typer.data.listsCompleted = 0;
      
      
      typer.data.maxStreak = 100;    
      typer.data.maxWPM = 100;

      typer.data.maxStreakBonus = 5;
      typer.data.maxSpeedBonus = 5;
      
      typer.data.version = currentVersion;

      typer.loadWords();
      
      typer.save();
    }

    typer.data.specialLetters = ["-"," ","'"];
    typer.data.vowels = ["A","E","I","O","U","Y"];
    typer.data.consonants = ["B","C","D","F","G","H","J","K","L","M","N","P","Q","R","S","T","V","W","X","Z"];

    typer.data.word = "";
    typer.data.lastWordSpeed = 0;
    typer.data.correct = false;
    typer.data.incorrect = false;
    typer.data.streak = 0;

    typer.data.newBonus = 2;      

    typer.data.vowelBaseCost = 50;
    typer.data.consonantBaseCost = 10;
    typer.data.spaceBaseCost = 5;
    typer.data.luckBaseCost = 100;
    typer.data.keyboardBaseCost = 100;

    typer.data.vowelMultiplier = 4;
    typer.data.consonantMultiplier = 1.65;
    typer.data.spaceMultiplier = 2;
    typer.data.luckMultiplier = 1.05;
    typer.data.keyboardMultiplier = 1.8;

    typer.data.maxSpace = 100;
    typer.data.maxLuck = 100;
    typer.data.maxKeyboard = 1000;

    typer.floaterCount = 0;
    typer.nextCount = 0;
    typer.currentCount = 0;
    typer.recentWords = [];


    typer.data.modalPage = 1;
    typer.data.nextList = {};

    typer.data.repeatBonus = .1;
    
    typer.data.baseUnlockedLetters = ["-","'"," "]



    

    $interval(function() {
      typer.save();
    }, 5000);
    
    //currentCost = baseCost * multiplier ^ timesPurchased
    typer.getVowelCost = function() {
      var base = typer.data.vowelBaseCost;
      var multi = typer.data.vowelMultiplier;
      var unlocked = typer.data.unlockedVowels - typer.getUpgradeVowels();

      var cost = Math.floor(base * Math.pow(multi,(unlocked - 1)));
      return cost;
    };
    typer.getConsonantCost = function() {
      var base = typer.data.consonantBaseCost;
      var multi = typer.data.consonantMultiplier;
      var unlocked = typer.data.unlockedConsonants - typer.getUpgradeConsonants();

      var cost = Math.floor(base * Math.pow(multi,unlocked));
      return cost;
    };
    typer.getSpaceCost = function() {
      return Math.floor(typer.data.spaceBaseCost * Math.pow(typer.data.spaceMultiplier,typer.data.spacePurchased - 1));
    };
    typer.getLuckCost = function() {
      return Math.floor(typer.data.luckBaseCost * Math.pow(typer.data.luckMultiplier,typer.data.luckPurchased));
    };
    typer.getKeyboardCost = function() {
      return Math.floor(typer.data.keyboardBaseCost * Math.pow(typer.data.keyboardMultiplier,typer.data.keyboardPurchased));
    };
        


    typer.getListByCode = function(code) {
      return typer.data.lists.filter(list => list.code == code)[0];
    };
    
    typer.getModalPageTitle = function() {
      var name = "You Win!";
      switch(typer.data.modalPage) {
        case 1:
          name = "You Win!"
          break;
        case 2:
          name = "Upgrades!"
          break;
        case 3:
          name = "Lists!"
          break;
        case 4:
          name = "Good luck"
          break;
        default:
          name = "You Win!"
      }
      return name;
    }
    typer.purchaseUpgrade = function(code){ 
      var upgrade = typer.data.upgrades.filter(upg => upg.code == code)[0];

      var cost = typer.getUpgradeCost(code);

      typer.data.prestigePoints -= cost;
      upgrade.purchased++;

      
      $('#' + code).popover('hide')
    };

    typer.getUpgradeCost = function(code){
      var upgrade = typer.data.upgrades.filter(upg => upg.code == code)[0];
      var cost = Math.round(upgrade.baseCost * Math.pow(upgrade.costMultiplier,upgrade.purchased));
      return cost;
    };

    typer.refundUpgrades = function() {
      var points = typer.getSpentPrestigePoints();
      typer.data.prestigePoints += points;

      typer.data.upgrades.forEach(upg => {
        upg.purchased = 0;
      });
    }
    

    typer.getSpentPrestigePoints = function() {
      var pointsSpent = 0;

      typer.data.upgrades.forEach(upgrade => {
        for (i = 0; i < upgrade.purchased; i++) {
          pointsSpent += Math.round(upgrade.baseCost * Math.pow(upgrade.costMultiplier,i));
        }                
      });

      return pointsSpent;
    }


    typer.deleteSave = function() {
      localStorage.removeItem('TypingSave');
      window.location.reload(false); 
    }

    typer.getWordsTyped = function() {
      var typed = 0;
      if (typer.data.words) {
        typed = typer.data.words.filter(word => word.typeCount > 0).length;
      }
      return typed;
    }

    
    typer.purchaseSpace = function() {
      $('#btnSpace').popover('hide')
      $('#btnSpace').blur();

      typer.data.money -= typer.getSpaceCost();
      typer.data.spacePurchased++;
    };

    typer.purchaseLuck = function() {
      $('#btnLuck').popover('hide')
      $('#btnLuck').blur();

      typer.data.money -= typer.getLuckCost();
      typer.data.luckPurchased++;
    };

    typer.purchaseKeyboard = function() {
      $('#btnKeyboard').popover('hide')
      $('#btnKeyboard').blur();

      typer.data.money -= typer.getKeyboardCost();
      typer.data.keyboardPurchased++;
    };

    typer.purchaseRandomConsonant = function() {
      var lockedConsonants = typer.data.consonants.filter(consonant => !typer.data.unlockedLetters.includes(consonant));
      var random = Math.floor(Math.random() * lockedConsonants.length - 1);
      if (random < 0) {
        random = 0;
      }

      typer.purchaseConsonant(lockedConsonants[random]);      
    };

    typer.purchaseRandomVowel = function() {
      var lockedVowels = typer.data.vowels.filter(vowel => !typer.data.unlockedLetters.includes(vowel));
      var random = Math.floor(Math.random() * lockedVowels.length - 1);
      if (random < 0) {
        random = 0;
      }

      typer.purchaseVowel(lockedVowels[random]);
    };

    typer.purchaseVowel = function(letter) {
      typer.data.money -= typer.getVowelCost();
      typer.data.unlockedLetters.push(letter.toUpperCase().trim());
      typer.data.unlockedVowels++;
    };

    typer.purchaseConsonant = function(letter) {
      typer.data.money -= typer.getConsonantCost();
      typer.data.unlockedLetters.push(letter.toUpperCase().trim());
      typer.data.unlockedConsonants++;
    };
    
    typer.displayLetter = function(letter) {
      return !typer.data.unlockedLetters.includes(letter);
    };

    typer.resetList = function() {
      typer.data.modalPage = 2;
      typer.showModal();
      typer.save();
    }

    typer.completeList = function() {
      typer.data.modalPage = 1;
      typer.data.prestigePoints += typer.data.currentList.pointsOnCompletion;
      typer.data.listCompleted = true;
      typer.data.listsCompleted++;
      typer.getListByCode(typer.data.currentList.code).completed++;
      typer.unlockNextList();
      typer.save();
      typer.showModal();
    }

    typer.unlockNextList = function() {      
      switch(typer.data.currentList.code) {
        case "gutenberg1":
          typer.getListByCode("gutenberg2").unlocked = true;
          break;
        case "gutenberg2":
          typer.getListByCode("gutenberg3").unlocked = true;
          break;
        case "gutenberg3":
          typer.getListByCode("gutenberg4").unlocked = true;
          break;
        case "gutenberg4":
          typer.getListByCode("gutenberg5").unlocked = true;
          break;
        case "gutenberg5":
          typer.getListByCode("gutenberg6").unlocked = true;
          break;
        case "gutenberg6":
          typer.getListByCode("gutenberg7").unlocked = true;
          break;
        case "gutenberg7":
          typer.getListByCode("gutenberg8").unlocked = true;
          break;
        case "gutenberg8":
          typer.getListByCode("gutenberg9").unlocked = true;
          break;
        case "gutenberg9":
          typer.getListByCode("gutenberg10").unlocked = true;
          break;
      }
    };

    typer.sum = function(items, prop){
      return items.reduce( function(a, b){
          return a + b[prop];
      }, 0);
    };

    typer.getLifetimeWordsTyped = function () {
      var current = typer.sum(typer.data.words, "typeCount");
      var previous = 0;
      
      if (typer.data.allWords) {
        previous = typer.sum(typer.data.allWords, "typeCount");
      }
      
      return current + previous;
    };

    typer.getLifetimeWordsMistyped = function() {
      var current = typer.sum(typer.data.words, "mistypeCount");
      var previous = 0;

      if (typer.data.allWords) {
        previous = typer.sum(typer.data.allWords, "mistypeCount");
      }

      return current + previous;
    };
    
    typer.getLifetimeWordsSeen = function() {
      var seen = 0;

      var unlockedWords = typer.getUnlockedWords().filter(word => word.typeCount + word.mistypeCount > 0).map(a => a.word);

      seen += unlockedWords.length;

      if (typer.data.allWords) {
        typer.data.allWords.forEach(word => {
          if (!unlockedWords.includes(word.word))
            seen++;
        });  
      }
      
      return seen;
    };

    typer.getTotalWordsTyped = function() {
      return typer.sum(typer.data.words, "typeCount");
    };

    typer.getTotalWordsMistyped = function() {
      return typer.sum(typer.data.words, "mistypeCount");
    };

    typer.getMostTyped = function() {
      var most = { typeCount: 0};
      typer.data.words.forEach(function (element) {
        if (element.typeCount > most.typeCount) {
          most = element;
        }
      });
      
      return most;
    };

    typer.getLifetimeMostTyped = function() {
      var most = { typeCount: 0};
      typer.data.words.forEach(function (element) {
        if (element.typeCount > most.typeCount) {
          most = element;
        }
      });

      if (typer.data.allWords) {
        typer.data.allWords.forEach(function (element) {
          if (element.typeCount > most.typeCount) {
            most = element;
          }
        });
      }
      
      return most;
    };

    typer.getMostMistyped = function() {
      var most = { mistypeCount: 0};
      typer.data.words.forEach(function (element) {
        if (element.mistypeCount > most.mistypeCount) {
          most = element;
        }
      });
      
      return most;
    };

    typer.getLifetimeMostMistyped = function() {
      var most = { mistypeCount: 0};
      typer.data.words.forEach(function (element) {
        if (element.mistypeCount > most.mistypeCount) {
          most = element;
        }
      });
      
      if (typer.data.allWords) {
        typer.data.allWords.forEach(function (element) {
          if (element.mistypeCount > most.mistypeCount) {
            most = element;
          }
        });
      }

      return most;
    };


    typer.getLifetimeLongestWord = function() {
      var typedWords = typer.data.words.filter(word => word.typeCount > 0);

      var longWord = "A";

      typedWords.forEach(function(element) {
        if (element.word.length > longWord.length) {
          longWord = element.word;
        }
      });

      if (typer.data.allWords) {        
        typer.data.allWords.forEach(function(element) {
          if (element.word.length > longWord.length) {
            longWord = element.word;
          }
        });
      }

      return longWord;
    }
    
    typer.getMaxSpaces = function() {
      var max = 0;

      typer.data.words.forEach(function(word) {
        if (word.word.length > max) {
          max = word.word.length;
        }
      });

      return max;
    };

    typer.getLongestWord = function() {
      var typedWords = typer.data.words.filter(word => word.typeCount > 0);

      var longWord = "A";

      typedWords.forEach(function(element) {
        if (element.word.length > longWord.length) {
          longWord = element.word;
        }
      });

      return longWord;
    };

    typer.amIStuck = function() {
      if ((typer.getUnlockedWords().filter(word => word.typeCount < 5).length == 0) && typer.data.money < typer.getConsonantCost() && typer.data.money < typer.getVowelCost() && typer.data.money < typer.getSpaceCost()) {
        return true;
      } else {
        return false;
      }
    };

    typer.resetWPM = function() {
      typer.data.highestWPM = 0;
    };
    
    typer.resetStreak = function() {
      typer.data.highestStreak = 0;
    };

    typer.getStreakBonus = function() {
      var bonus = 1;

      if (typer.getUnlockedWords().length > 1) {    //no bonuses on duplicate words    
        bonus = 1 + (typer.data.maxStreakBonus * (typer.data.streak / typer.data.maxStreak));

        if (bonus > typer.data.maxStreakBonus + typer.getUpgradeStreak()) {
          bonus = typer.data.maxStreakBonus + typer.getUpgradeStreak();
        }
      }
      return bonus;
    };
    typer.getStreakMultiplierSize = function() {
      var multi = typer.getStreakBonus();
      var percent = multi/typer.data.maxStreakBonus;
      var rem = 1 + percent;
      return rem + "rem";
    };
    typer.getSpeedMultiplierSize = function() {
      var multi = typer.getSpeedBonus();
      var percent = multi/typer.data.maxSpeedBonus;
      var rem = 1 + percent;
      return rem + "rem";
    };

    typer.getSpeedBonus = function() {
      var bonus = 1;

      if (typer.getUnlockedWords().length > 1) {  
        bonus = 1 + (typer.data.maxSpeedBonus * (typer.getWPM() / typer.data.maxWPM));
        
        if (bonus > typer.data.maxSpeedBonus + typer.getUpgradeSpeed())
        {
          bonus = typer.data.maxSpeedBonus + typer.getUpgradeSpeed();
        }
      }
      return bonus;
    };

    typer.getNewBonus = function() {
      return typer.data.currentWord.typeCount == 0 ? typer.data.newBonus : 1;
    };

    typer.getKeyboardBonus =function() {
      return typer.data.keyboardPurchased;
    }

    typer.getTimePlayed = function() {
      var timePlayed = typer.data.timePlayed;
      timePlayed += (Date.now() - typer.data.timeLoaded) / 1000;

      var seconds = Math.floor(timePlayed);
      if (seconds < 60) { //seconds
        return seconds + "s";
      }
      if (seconds < 3600) { //minutes
        return Math.floor(seconds/60) + "m " + String("0" + Math.floor(seconds % 60)).substr(-2) + "s";
      }
      if (seconds < 86400) { //hours
        return Math.floor(seconds/3600) + "h " + String("0" + Math.floor(seconds % 3600 / 60)).substr(-2) + "m " + String("0" + Math.floor(seconds % 60)).substr(-2) + "s";
      }
      //days
      return Math.floor(seconds/86400) + "d " + String("0" + Math.floor(seconds % 86400 / 3600)).substr(-2) + "h " + String("0" + Math.floor(seconds % 3600 / 60)).substr(-2) + "m " + String("0" + Math.floor(seconds % 60)).substr(-2) + "s";
    }

    

    typer.getWPM = function() {
      var recent = [];

      if (typer.recentWords) {
        recent = typer.recentWords.filter(word => ((Date.now() - word.typedOn) / 1000 < 60));
      }
      

      if (recent.length > typer.data.highestWPM) {
        typer.data.highestWPM = recent.length;
      }

      typer.recentWords = recent.slice(0);
      return recent.length;
    }

    typer.getKeyboardValue = function() {
      return Math.round((typer.data.keyboardPurchased + typer.getUpgradeCashBonus()) * typer.getRepeatListBonus());
    }
    typer.almostFinish = function() {
      typer.data.words.forEach(function(word) { 
        word.typeCount = 1;
      });

      typer.luckPurchased = 100;
      
      typer.data.unlockedLetters = typer.data.specialLetters.concat(typer.data.vowels).concat(typer.data.consonants);
      typer.data.unlockedVowels = 6;
      typer.data.unlockedConsonants = 20;
      typer.data.spacePurchased = 20;

    }

    typer.setMinumumUnlocks = function() {
      //reset unlocked chars to minimum
      var fewest = { word: "", num: 100 }
      typer.data.words.forEach(function(word) {
        var num = word.word.split('').filter(function(item, i, ar){ return ar.indexOf(item) === i; }).join('').length;
        if (num < fewest.num || word.word.toUpperCase() == "A") {         
          fewest.word = word.word;
          fewest.num = num;
        } else if (num == fewest.num && word.word.length < fewest.word.length) {            
          fewest.word = word.word;
          fewest.num = num;
        }        
      });
      
      typer.data.unlockedVowels = 0;
      typer.data.unlockedConsonants = 0;
      typer.data.unlockedLetters = typer.data.baseUnlockedLetters.slice(0);
      fewest.word.split('').filter(function(item, i, ar){ return ar.indexOf(item) === i; }).forEach(element => {
        element = element.toUpperCase();
        typer.data.unlockedLetters.push(element.trim())
        if (typer.data.vowels.includes(element)) {
          typer.data.unlockedVowels++;
        }
        if (typer.data.consonants.includes(element)) {
          typer.data.unlockedConsonants++;
        }
      });
      typer.data.spacePurchased = fewest.word.length;
    };
    


    typer.startNewList = function() {      
      //load new list
      typer.data.nextWord = "";
      typer.data.word = "";
      typer.data.money = 0;
      typer.data.correct = false;
      typer.data.incorrect = false;

      typer.data.listCompleted = false;

      typer.data.currentList = typer.data.nextList;
      typer.data.nextList = {};
      typer.loadWords(); //also reset unlocks to minimum viable + //populate counts from storage + //save words to all words
      

      //reset purchases
      typer.data.keyboardPurchased = 1;
      typer.data.luckPurchased = 0;

      
      //reset stats? TODO

      

      typer.save();
    }



    typer.floatMoney = function(money) {
      //create newElement #moneyFloater + typer.floaterCount in floaterDiv

      var newFloater = document.createElement("div");
      var newFloaterId = "moneyFloater" + typer.floaterCount;
      newFloater.setAttribute("id", newFloaterId);
      newFloater.setAttribute("class", "floatingMoney");
      typer.floaterCount++;

      var text = document.createTextNode("+$" + Math.floor(money));
      newFloater.appendChild(text);

      var element = $("#floaterDiv")[0];

      element.appendChild(newFloater);

      anime({
        targets: "#" + newFloaterId,
        translateY: -100,
        duration: 1000,
        easing: 'linear',
        opacity: 0,
      });

      //remove element
      $timeout(function() {
        element.removeChild(newFloater);
      }, 1000);
    }

    typer.checkWordForDifferencesSoFar = function() {        
        var word2 = typer.data.word.toUpperCase();
        var word1 = typer.data.currentWord.word.substr(0, word2.length).toUpperCase();
  
        var differences = 0;
        var i = 0;
        word1.split('').forEach(char => {
          if (word2.split('')[i] != char) {
            differences++;
          }
          i++;        
        });
  
        return differences;
    };

    typer.getRepeatListBonus = function() {
      return 1 + (typer.data.currentList.completed * typer.data.repeatBonus);
    };
    
    $scope.$watch("typer.data.word", function() {
      if (typer.data.currentWord) {
        if (typer.data.word.toUpperCase() == typer.data.currentWord.word.toUpperCase() || (typer.data.currentWord.word.length == typer.data.word.length && typer.checkWordForDifferencesSoFar() <= typer.getAllowedTypos())) {             
          var newBonus = typer.getNewBonus();
          var streakBonus = typer.getStreakBonus();
          var speedBonus = typer.getSpeedBonus();
          var keyboardBonus = typer.getKeyboardBonus();
          var repeatBonus = typer.getRepeatListBonus();
          typer.data.lastSpeedBonus = speedBonus;

          var totalBonus = newBonus * streakBonus * speedBonus * repeatBonus * (keyboardBonus + typer.getUpgradeCashBonus());
          var money = Math.round(typer.data.currentWord.length * totalBonus);

          typer.data.money += money;    
          typer.data.currentWord.typeCount++;
          typer.data.correct = true;

          if (typer.getUnlockedWords().length > 1) {
            //add multiple words if space
            typer.data.streak += typer.data.currentWord.word.split(" ").length;

            if (typer.data.streak > typer.data.highestStreak) {
              typer.data.highestStreak = typer.data.streak;
            }
  
            typer.data.currentWord.word.split(" ").forEach(function(word) {
              typer.recentWords.push({
                word: word,
                typedOn: Date.now()
              });
            });
            

          }
          

          if (typer.getWordsTyped() == typer.data.words.length) {
            typer.completeList();
          } else {

            //animate money
            typer.floatMoney(money);
            
            $timeout(function() {
              typer.getNewWord();
              typer.data.word = "";
              typer.data.correct = false;
              typer.data.currentWordTimer  = performance.now();
            }, 100);
          }
        };
        
        if (!typer.data.currentWord.word.toUpperCase().startsWith(typer.data.word.toUpperCase())) {
          if (typer.checkWordForDifferencesSoFar() > typer.getAllowedTypos()) {
            typer.data.incorrect = true;
            typer.data.streak = 0;
            typer.data.currentWord.mistypeCount++;
  
            //incorrect shake
            anime({
              targets: '.currentWord',
              translateX: ['-.5rem', '.5rem'],
              duration: 75,    
              direction: 'alternate',
              loop: 5,
              easing: 'linear',
            });
  
            $timeout(function() {
              typer.getNewWord();
              typer.data.word = "";
              typer.data.incorrect = false;            
              typer.data.currentWordTimer  = performance.now();
            }, 500);
          } else {
            typer.hasTypo = true;
          }          
        };
      };
    });

    $(document).keypress(function(e){   
      if (["1","2","3","4","5","6","7","8","9","0"].includes(e.key)) {
        switch (e.key) {
          case "1":
            if (typer.data.money >= typer.getVowelCost()) {
              typer.purchaseRandomVowel();
            }            
            break;
          case "2":
            if (typer.data.money >= typer.getConsonantCost()) {
              typer.purchaseRandomConsonant();
            }            
            break;
          case "3":
            if (typer.data.money >= typer.getSpaceCost()) {
              typer.purchaseSpace();
            }            
            break;
          case "4":
            if (typer.data.money >= typer.getKeyboardCost()) {
              typer.purchaseKeyboard();
            }            
            break;
          case "5":
            if (typer.data.money >= typer.getLuckCost()) {
              typer.purchaseLuck();
            }            
            break;
        }
      }
      else if (!typer.data.correct && !typer.data.incorrect && e.key.toUpperCase() != "ENTER") {
        if (typer.data.word.length == 0 && e.key.toUpperCase() == " ") {
          //if space is the first thing pressed, don't count as error.
        } else {
          if (e.key.toUpperCase() != "BACKSPACE")
          typer.data.word += e.key.toUpperCase();   
        }        
      }
      if (e.key == "'" || e.key.toUpperCase() == "BACKSPACE" || e.key.toUpperCase == " ") {
        e.preventDefault();
      }     
      
      
      $scope.$apply();  
    });
      
  });

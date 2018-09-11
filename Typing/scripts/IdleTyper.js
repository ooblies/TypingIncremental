$(function() {
  // Focus on load
  $('.typeHere').focus();
  // Force focus
  $('.typeHere').focusout(function(){
      $('.typeHere').focus();
  });
  
  $('[data-toggle="tooltip"]').tooltip()
});

angular.module('typerApp', [])
  .controller('TyperController', function($http, $scope, $timeout, $interval) {
    var typer = this;   
    

    typer.data = {};
    typer.data.currentVersion = 2; //changing this will delete older saves until you do a merging thing.

    typer.loadWords = function() {
      $http.get("words/1000/" + typer.data.currentList + ".txt").then(function success(response) {      
        typer.data.wordData = response.data.split("\n"[0]);
  
        typer.data.wordData.forEach(function(element) {
          typer.data.words.push({
            word:element.trim(),
            length:element.trim().length,
            typeCount:0,
            mistypeCount:0,
          })
        });

        typer.getNewWord();
  
      }, function error(response) {
        debugger;
      });
    }
    typer.load = function() {
      var data = localStorage.getItem('TypingSave');
      var parsed = JSON.parse(data);      
      typer.data = parsed;
      typer.data.timeLoaded = Date.now();

      if (typer.data.words.length == 0) {
        typer.loadWords();
      } else {
        typer.getNewWord();
      }      
    };

    typer.save = function() {
      var save = {};

      save.currentList = typer.data.currentList;
      save.words = typer.data.words;
      save.money = typer.data.money;

      save.unlockedLetters = typer.data.unlockedLetters;
      save.unlockedVowels = typer.data.unlockedVowels;
      save.unlockedConsonants = typer.data.unlockedConsonants;
      
      save.spacePurchased = typer.data.spacePurchased;
      save.luckPurchased = typer.data.luckPurchased;
      save.keyboardPurchased = typer.data.keyboardPurchased;

      save.highestStreak = typer.data.highestStreak;
      save.highestWPM = typer.data.highestWPM;

      save.timePlayed = (Date.now() - typer.data.timeLoaded) / 1000;
      
      save.version = 2;

      localStorage.setItem('TypingSave', JSON.stringify(save));
    }
    

    typer.getUnlockedWords = function() {
      var filtered = typer.data.words.filter(function(word) {
        var unlocked = true;    

        if (word.length <= typer.data.spacePurchased) {
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

      var filteredNew = filtered.filter(word => word.typeCount == 0);
      
      var luck = Math.floor(Math.random() * 101); //1-100

      if (luck < typer.data.luck && filteredNew.length > 0) { //if luck is under player luck
        var newWord = filteredNew[Math.floor(Math.random() * filteredNew.length)];
      } else {
        var newWord = filtered[Math.floor(Math.random() * filtered.length)];
      }

      typer.data.lastWord = typer.data.currentWord;
      typer.data.currentWord = typer.data.nextWord;
      typer.data.nextWord = newWord;

      if (!typer.data.currentWord) {
        typer.getNewWord();

      }
    };
    
    if (localStorage.TypingSave) {
      typer.load();
    } 

    if (!localStorage.TypingSave || typer.data.version < typer.data.currentVersion) {
      typer.data.currentList = 'gutenberg';
      typer.data.words = [];
      typer.data.money = 0;
      typer.data.unlockedLetters = ["'"," ","A"];
      typer.data.unlockedVowels = 1;
      typer.data.unlockedConsonants = 0;
      
      typer.data.spacePurchased = 1;
      typer.data.luckPurchased = 0;
      typer.data.keyboardPurchased = 1;

      typer.data.timePlayed = 0; //seconds
      typer.data.timeLoaded = Date.now();
      typer.data.highestStreak = 0;
      typer.data.highestWPM = 0;
      
      typer.data.version = 2;

      typer.loadWords();
      
      typer.save();
    }

    typer.data.word = "";
    typer.data.lastWordSpeed = 0;
    typer.data.correct = false;
    typer.data.incorrect = false;
    typer.data.streak = 0;
    typer.data.maxStreak = 100;
    typer.data.streakBonus = 5;
    typer.data.newBonus = 2;
    
  
    typer.data.speedBonusMaxWPM = 100;
    typer.data.speedBonus = 5;

    typer.data.vowelBaseCost = 50;
    typer.data.consonantBaseCost = 10;
    typer.data.spaceBaseCost = 5;
    typer.data.luckBaseCost = 100;
    typer.data.keyboardBaseCost = 100;

    typer.data.vowelMultiplier = 4;
    typer.data.consonantMultiplier = 2;
    typer.data.spaceMultiplier = 2.5;
    typer.data.luckMultiplier = 1.1;
    typer.data.keyboardMultiplier = 2;

    typer.data.maxSpace = 100;
    typer.data.maxLuck = 100;
    typer.data.maxKeyboard = 1000;

    typer.floaterCount = 0;
    typer.recentWords = [];



    

    $interval(function() {
      typer.save();
    }, 5000);
    
    //currentCost = baseCost * multiplier ^ timesPurchased
    typer.getVowelCost = function() {
      return Math.floor(typer.data.vowelBaseCost * Math.pow(typer.data.vowelMultiplier,(typer.data.unlockedVowels - 1)));
    };
    typer.getConsonantCost = function() {
      return Math.floor(typer.data.consonantBaseCost * Math.pow(typer.data.consonantMultiplier,typer.data.unlockedConsonants));
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
      typer.data.money -= typer.getSpaceCost();
      typer.data.spacePurchased++;

      $('#btnSpace').tooltip('hide')
    };

    typer.purchaseLuck = function() {
      typer.data.money -= typer.getLuckCost();
      typer.data.luckPurchased++;

      $('#btnLuck').tooltip('hide')
    };

    typer.purchaseKeyboard = function() {
      typer.data.money -= typer.getKeyboardCost();
      typer.data.keyboardPurchased++;

      $('#btnKeyboard').tooltip('hide')
    };


    typer.purchaseVowel = function(letter) {
      typer.data.money -= typer.getVowelCost();
      typer.data.unlockedLetters.push(letter.toUpperCase());
      typer.data.unlockedVowels++;
    };

    typer.purchaseConsonant = function(letter) {
      typer.data.money -= typer.getConsonantCost();
      typer.data.unlockedLetters.push(letter.toUpperCase());
      typer.data.unlockedConsonants++;
    };
    
    typer.displayLetter = function(letter) {
      return !typer.data.unlockedLetters.includes(letter);
    };

    typer.win = function() {
      typer.data.words.forEach(function(element) {
        var typed = Math.floor(Math.random() * 101);
        var mistyped = Math.floor(Math.random() * 101);
        element.typeCount = typed;
        element.mistypeCount = mistyped;
      });
    };

    typer.winScreen = function() {
      $('#winModal').modal('show');
    }

    typer.sum = function(items, prop){
      return items.reduce( function(a, b){
          return a + b[prop];
      }, 0);
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

    typer.getMostMistyped = function() {
      var most = { mistypeCount: 0};
      typer.data.words.forEach(function (element) {
        if (element.mistypeCount > most.mistypeCount) {
          most = element;
        }
      });
      
      return most;
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

      if (typer.data.lastWord && typer.data.currentWord.word != typer.data.lastWord.word) {    //no bonuses on duplicate words    
        bonus = 1 + (typer.data.streakBonus*typer.data.streak/typer.data.maxStreak);

        if (bonus > typer.data.streakBonus) {
          bonus = typer.data.streakBonus;
        }
      }
      return bonus;
    };

    typer.getSpeedBonus = function() {
      var bonus = 1;

      if (typer.data.lastWord && typer.data.currentWord.word != typer.data.lastWord.word) {  
        var wpm = typer.getWPM();
        var bonusPercent = wpm / typer.data.speedBonusMaxWPM;
        if (bonusPercent > 1) {
          bonusPercent = 1;
        }
          
        bonus = bonusPercent * typer.data.speedBonus;     
        
        if (bonus < 1) {
          bonus = 1;
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
      return recent.length;
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
    
    $scope.$watch("typer.data.word", function() {
      if (typer.data.currentWord) {
      if (typer.data.word.toUpperCase() == typer.data.currentWord.word.toUpperCase()) {    
          var newBonus = typer.getNewBonus();
          var streakBonus = typer.getStreakBonus();
          var speedBonus = typer.getSpeedBonus();
          var keyboardBonus = typer.getKeyboardBonus();
          typer.data.lastSpeedBonus = speedBonus;

          var totalBonus = newBonus * streakBonus * speedBonus * keyboardBonus;
          var money = typer.data.currentWord.length * totalBonus;

          typer.data.money += money;    
          typer.data.currentWord.typeCount++;
          typer.data.correct = true;
          typer.data.streak++;
          if (typer.data.streak > typer.data.highestStreak) {
            typer.data.highestStreak = typer.data.streak;
          }

          typer.recentWords.push({
            word: typer.data.currentWord.word,
            typedOn: Date.now()
          });

          if (typer.getWordsTyped() == typer.data.words.length) {
            typer.winScreen();
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

        if (!typer.data.currentWord.word.toUpperCase().startsWith(typer.data.word.toUpperCase()) ) {
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
          }, 1000);
        };
      };
    });

    $(document).keypress(function(e){
      if (!typer.data.correct && !typer.data.incorrect && e.key.toUpperCase() != "ENTER") {
        typer.data.word += e.key.toUpperCase();
        $scope.$apply();
      }
    });
      
  });

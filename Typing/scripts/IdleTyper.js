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

    

    if (localStorage.TypingSave) {
      var data = localStorage.getItem('TypingSave');
      var parsed = JSON.parse(data);
      typer.data = parsed;

    } else {
      typer.data = {};
      typer.data.word = "";
      typer.data.words = [];
      typer.data.money = 0;
      typer.data.correct = false;
      typer.data.incorrect = false;
      typer.data.vowelCost = 50;
      typer.data.consonantCost = 10;
      typer.data.space = 1;
      typer.data.maxSpace = 20;
      typer.data.spaceCost = 20;
      typer.data.luck = 0;
      typer.data.maxLuck = 100;
      typer.data.luckCost = 50;
      typer.data.multiplier = 1.5;
      typer.data.unlockedLetters = ["A"];
      typer.data.unlockedVowels = 1;
      typer.data.unlockedConsonants = 0;
      typer.data.keyboardCost = 100;
      typer.data.keyboardMultiplier = 1;
      typer.data.speed = 1000;
      typer.data.speedCost = 1000;      
      typer.data.admin = false;

      $http.get("words/words.txt").then(function success(response) {      
        typer.data.wordData = response.data.split("\n"[0]);
  
        typer.data.wordData.forEach(function(element) {
          typer.data.words.push({
            word:element,
            length:element.length,
            typeCount:0,
            mistypeCount:0,
          })
        });

        typer.getNewWord();
  
      }, function error(response) {
        debugger;
      });
      
      localStorage.setItem('TypingSave', JSON.stringify(typer.data));
    }

    $interval(function() {
      localStorage.setItem('TypingSave', JSON.stringify(typer.data));
    }, 5000);
    

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

    typer.getNewWord = function() { 
      var filtered = typer.data.words.filter(function(word) {
        var unlocked = true;    

        if (word.length <= typer.data.space) {
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
      //unlocked letters

      var filteredNew = filtered.filter(word => word.typeCount == 0);
      
      var luck = Math.floor(Math.random() * 101); //1-100

      if (luck < typer.data.luck && filteredNew.length > 0) { //if luck is under player luck
        var newWord = filteredNew[Math.floor(Math.random() * filteredNew.length)];
      } else {
        var newWord = filtered[Math.floor(Math.random() * filtered.length)];
      }

      typer.data.currentWord = newWord;
    };

    typer.purchaseSpace = function() {
      typer.data.money -= typer.data.spaceCost;
      typer.data.space++;
      typer.getNewWord();
      typer.data.spaceCost = Math.floor(typer.data.spaceCost * typer.data.multiplier);

      $('#btnSpace').tooltip('hide')
    };

    typer.purchaseLuck = function() {
      typer.data.money -= typer.data.luckCost;
      typer.data.luck++;
      typer.getNewWord();
      typer.data.luckCost = Math.floor(typer.data.luckCost * typer.data.multiplier);

      $('#btnLuck').tooltip('hide')
    };

    typer.purchaseKeyboard = function() {
      typer.data.money -= typer.data.keyboardCost;
      typer.data.keyboardCost = Math.floor(typer.data.keyboardCost * typer.data.multiplier);
      typer.data.keyboardMultiplier++;

      $('#btnKeyboard').tooltip('hide')
    };

    typer.purchaseSpeed = function() {
      typer.data.money -= typer.data.speedCost;
      typer.data.speedCost = Math.floor(typer.data.speedCost * typer.data.multiplier);
      typer.data.speed-=100;

      $('#btnSpeed').tooltip('hide')
    };

    typer.purchaseVowel = function(letter) {
      typer.data.money -= typer.data.vowelCost;
      typer.data.unlockedLetters.push(letter.toUpperCase());
      typer.data.vowelCost = Math.floor(typer.data.vowelCost * typer.data.multiplier);
      typer.data.unlockedVowels++;
      typer.getNewWord();
    };

    typer.purchaseConsonant = function(letter) {
      typer.data.money -= typer.data.consonantCost;
      typer.data.unlockedLetters.push(letter.toUpperCase());
      typer.data.consonantCost = Math.floor(typer.data.consonantCost * typer.data.multiplier);
      typer.data.unlockedConsonants++;
      typer.getNewWord();
    };
    
    typer.displayLetter = function(letter) {
      return !typer.data.unlockedLetters.includes(letter);
    };


    
    $scope.$watch("typer.data.word", function() {
      if (typer.data.currentWord) {
        if (typer.data.word == typer.data.currentWord.word) {        
          typer.data.money += typer.data.currentWord.typeCount == 0 ? 5 * typer.data.currentWord.length * typer.data.keyboardMultiplier : typer.data.currentWord.length * typer.data.keyboardMultiplier;
          typer.data.currentWord.typeCount++;
          typer.data.correct = true;

          $timeout(function() {
            typer.getNewWord();
            typer.data.word = "";
            typer.data.correct = false;
          }, typer.data.speed);
        };

        if (typer.data.word.toUpperCase() == "ADMIN") {
          typer.data.admin = !typer.data.admin;
          
          typer.data.word = "";
        }

        if (!typer.data.currentWord.word.startsWith(typer.data.word) && !"admin".startsWith(typer.data.word)) {
          typer.data.incorrect = true;
          typer.data.currentWord.mistypeCount++;

          $timeout(function() {
            typer.getNewWord();
            typer.data.word = "";
            typer.data.incorrect = false;
          }, typer.data.speed);
        };
      };
    });

    $(document).keypress(function(e){
      if (!typer.data.correct && !typer.data.incorrect) {
        typer.data.word += e.key;
        $scope.$apply();
      }
    });
      
  });

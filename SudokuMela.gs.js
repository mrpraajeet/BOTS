//This is a Sudoku extension for Google Sheets using Google Apps Script (.gs)

const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Sudoku")
    .addItem("Submit", "submitSudoku")
    .addItem("Solve", "solveSudoku")
    .addSeparator()
    .addItem("New Easy", "newSudokuEasy")
    .addItem("New Medium", "newSudokuMedium")
    .addItem("New Hard", "newSudokuHard")
    .addToUi();
}

function newSudoku(k) {
  sheet.getRange("A1:I9").clearContent();
  PropertiesService.getScriptProperties().deleteProperty("sudokuSolution");

  for (let i = 1; i <= 9; i++) {
    sheet.setRowHeight(i, 40);
    sheet.setColumnWidth(i, 40);
  }

  const rule = SpreadsheetApp.newDataValidation().requireNumberBetween(1, 9).build();

  for(let row = 0; row < 9; row++) {
    for(let col = 0; col < 9; col++) {
      const cell = sheet.getRange(row + 1, col + 1);
      const boxIndex = Math.floor(row / 3) * 3 + Math.floor(col / 3);

      cell.setDataValidation(rule)
        .setBackground(boxIndex % 2 === 0 ? "#A7C7E7" : "#A8D8B8")
        .setHorizontalAlignment("center")
        .setVerticalAlignment("middle");
    }
  }

  const completeSudoku = generateSudoku();
  const incompleteSudoku = completeSudoku.map(row => row.slice());
  const size = completeSudoku.length;
  PropertiesService.getScriptProperties().setProperty("sudokuSolution", JSON.stringify(completeSudoku));

  while (k-- > 0) {
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);

    if (incompleteSudoku[row][col] === 0) continue;
    incompleteSudoku[row][col] = 0;
  }

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const value = incompleteSudoku[row][col];
      const cell = sheet.getRange(row + 1, col + 1);

      if (value !== 0) cell.setValue(value).protect();
      else cell.setValue("").remove();
    }
  }
}

function newSudokuEasy() {
  newSudoku(30);
}

function newSudokuMedium() {
  newSudoku(45);
}

function newSudokuHard() {
  newSudoku(60);
}

function submitSudoku() {
  const rowSets = Array.from({ length: 9 }, () => new Set());
  const colSets = Array.from({ length: 9 }, () => new Set());
  const boxSets = Array.from({ length: 9 }, () => new Set());
  let isCorrect = true;

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const value = sheet.getRange(row + 1, col + 1).getValue();
      const boxIndex = Math.floor(row / 3) * 3 + Math.floor(col / 3);

      if (value === null || rowSets[row].has(value) || 
          colSets[col].has(value) || boxSets[boxIndex].has(value)) {
        isCorrect = false;
        break;
      }

      rowSets[row].add(value);
      colSets[col].add(value);
      boxSets[boxIndex].add(value);
    }
  }

  SpreadsheetApp.getUi().alert(isCorrect ? "Correct" : "Incorrect, Please try again.");
}

function solveSudoku() {
  const solution = JSON.parse(PropertiesService.getScriptProperties().getProperty("sudokuSolution"));

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const value = solution[row][col];
      const cell = sheet.getRange(row + 1, col + 1);
      cell.setValue(value);
    }
  }
}

function generateSudoku() {
  const sudoku = Array.from({ length: 9 }, () => Array(9).fill(0));
  const rowSets = Array.from({ length: 9 }, () => new Set());
  const colSets = Array.from({ length: 9 }, () => new Set());
  const boxSets = Array.from({ length: 9 }, () => new Set());

  fillSudoku(sudoku, rowSets, colSets, boxSets);
  return sudoku;
}

function fillSudoku(sudoku, rowSets, colSets, boxSets) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (sudoku[row][col] === 0) {
        const numbers = shuffle(Array.from({ length: 9 }, (_, i) => i + 1));
        for (let num of numbers) {
          const boxIndex = Math.floor(row / 3) * 3 + Math.floor(col / 3);

          if (!rowSets[row].has(num) && !colSets[col].has(num) && !boxSets[boxIndex].has(num)) {
            sudoku[row][col] = num;
            rowSets[row].add(num);
            colSets[col].add(num);
            boxSets[boxIndex].add(num);

            if (fillSudoku(sudoku, rowSets, colSets, boxSets)) return true;
            sudoku[row][col] = 0;
            rowSets[row].delete(num);
            colSets[col].delete(num);
            boxSets[boxIndex].delete(num);
          }
        }
        return false;
      }
    }
  }
  return true;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
import fs from 'fs';
import ZipAdm from 'adm-zip';
import sqlite3 from 'sqlite3';
import { indexesOf } from './helpers/indexes-of';

export const ankiToJson = (inputFile: string, outputDir?: string) => {
  const name: string = inputFile.split('/').pop().split('.')[0];
  const dir: string = outputDir !== undefined ? outputDir : './' + name;

  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const zipAdm: ZipAdm = new ZipAdm(fs.readFileSync(inputFile));
  const zipEntries = zipAdm.getEntries();

  zipEntries.forEach(function (zipEntry) {
    fs.writeFileSync(`${dir}/${zipEntry.entryName}`, zipEntry.getData(), {
      encoding: 'binary'
    });
  });

  const db = new sqlite3.Database(`${dir}/collection.anki2`);

  db.all('SELECT id, flds, sfld FROM notes', (err, notes) => {
    if (err) {
      return console.log('ERROR', err);
    }
    notes = notes.map((note) => {
      note.media = [];
      note.front = note.sfld
        .replaceAll('\u001F', '\n')
        .replaceAll('<div>', '\n')
        .replaceAll('<br>', '\n')
        .replace(/<(?:.|\n)*?>/gm, '');
      note.back = note.flds
        .replaceAll('\u001F', '\n')
        .replaceAll('<div>', '\n')
        .replaceAll('<br>', '\n')
        .replace(/<(?:.|\n)*?>/gm, '');
      const openBracketIndexes = [];
      const closedBracketIndexes = [];
      // FRONT
      for (let i = 0; i < note.front.length; i++) {
        if (note.front[i] === '[') {
          openBracketIndexes.push(i);
        }
        if (note.front[i] === ']') {
          closedBracketIndexes.push(i);
        }
      }
      while (openBracketIndexes.length) {
        const start = openBracketIndexes.shift();
        const end = closedBracketIndexes.shift();
        const bracketString = note.front.slice(start + 1, end);
        if (bracketString.includes(':')) {
          note.media.push(bracketString.split(':')[1]);
          note.front = note.front.slice(0, start) + note.front.slice(end + 1);
        }
      }
      // BACK
      for (let i = 0; i < note.back.length; i++) {
        if (note.back[i] === '[') {
          openBracketIndexes.push(i);
        }
        if (note.back[i] === ']') {
          closedBracketIndexes.push(i);
        }
      }
      while (openBracketIndexes.length) {
        const start = openBracketIndexes.shift();
        const end = closedBracketIndexes.shift();
        const bracketString = note.back.slice(start + 1, end);
        if (bracketString.includes(':')) {
          note.media.push(bracketString.split(':')[1]);
          note.back = note.back.slice(0, start) + note.back.slice(end + 1);
        }
      }
      // TODO: images, items, sentences
      // LASTLY ensure no dublicates, remove access words, if the word does not exist, remove entry
      // <img src=\"
      // IMAGES
      const images = indexesOf('<img', note.flds, false);
      images.forEach((imageIndex) => {
        const imageStr = note.flds.slice(imageIndex);
        const innerQuotes = imageStr.match(/"([^"]*)"/)[1];
        note.media.push(innerQuotes);
      });
      note.media = [...new Set(note.media)];
      note.front = note.front.trim();
      note.back = note.back.trim();
      return note;
    });
    // create
    fs.writeFileSync(dir + '/notes.json', JSON.stringify(notes, null, 2));
    // cleanup
    fs.unlinkSync(dir + '/collection.anki2');
    // close
    db.close();
  });
};

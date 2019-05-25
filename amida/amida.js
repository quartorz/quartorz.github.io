(() => {
  'use strict';

  class Data {
    constructor(divElm) {

    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const list = document.getElementById('list');
    const item = document.getElementById('item');

    const add = document.getElementById('add-data');
    add.addEventListener('click', () => {
      const newItem = item.cloneNode(true);
      newItem.removeAttribute('id');
      newItem.getElementsByClassName('remove')[0].addEventListener('click', () => {
        newItem.remove();
      });
      list.insertBefore(newItem, add);
    });

    const fontSizeElem = document.getElementById('fontsize');
    const numOfSwapElem = document.getElementById('numofswap');
    const shuffleLabels = document.getElementById('shuffle-labels');

    const gen = document.getElementById('generate');
    const canvas = document.getElementById('canvas');
    const image = document.getElementById('image');
    gen.addEventListener('click', () => {
      const labels = [...list.getElementsByClassName('label')].map(v => v.value);
      const results = [...list.getElementsByClassName('result')].map(v => v.value);
      generateAmida(canvas, labels, results, {
        fontSize: parseInt(fontSizeElem.value),
        numOfSwap: parseInt(numOfSwapElem.value),
        shuffleLabels: shuffleLabels.checked,
      });
      image.removeAttribute('style');
      image.src = canvas.toDataURL();
    });

  });

  function generateAmida(canvas, labels, results, configs) {
    const fontSize = configs.fontSize || 15;
    const numOfSwap = configs.numOfSwap || 10;
    const shuffleLabels = !!configs.shuffleLabels;
    const font = `${fontSize}px Sans Serif`;
    const padding = fontSize * 3.333;
    const cellHeight = 20;
    let lineLength = 0;

    canvas.width = 0;
    canvas.height = 0;

    let labelWidth = 0;
    let resultWidth = 0;

    let ctx = canvas.getContext('2d');
    ctx.font = font;
    labels.forEach(v => {
      labelWidth = Math.max(labelWidth, ctx.measureText(v).width + 5);
    });
    results.forEach(v => {
      resultWidth = Math.max(resultWidth, ctx.measureText(v).width + 5);
    });

    const labelSwap = Array.apply(null, Array(labels.length)).map((_, i) => i);
    const resultSwap = Array.apply(null, Array(results.length)).map((_, i) => i);
    const swapList = [];
    if (labels.length > 2) {
      let sameHeightSwaps = [];
      let lastSameHeightSwaps = [];
      for (let i = 0; i < numOfSwap; ++i) {
        const swap = Math.floor(Math.random() * (labels.length - 1));
        // console.log('current: %o\nlast: %o\nswap: %o', sameHeightSwaps, lastSameHeightSwaps, swap);
        if (sameHeightSwaps.indexOf(swap) !== -1) {
          --i;
          continue;
        } else 
        if (sameHeightSwaps.some(v => Math.abs(swap - v) <= 1)) {
          [resultSwap[swap], resultSwap[swap + 1]] = [resultSwap[swap + 1], resultSwap[swap]];
          swapList.push(sameHeightSwaps);
          lastSameHeightSwaps = sameHeightSwaps;
          sameHeightSwaps = [swap];
          lineLength += cellHeight;
        } else if (lastSameHeightSwaps.indexOf(swap) !== -1) {
          --i;
          continue;
        } else {
          [resultSwap[swap], resultSwap[swap + 1]] = [resultSwap[swap + 1], resultSwap[swap]];
          sameHeightSwaps.push(swap);
        }
      }
      swapList.push(sameHeightSwaps);
      lineLength += cellHeight;
      if (shuffleLabels) {
        for (let i = 0; i < labels.length; ++i) {
          const swap1 = Math.floor(Math.random() * (labels.length - 1));
          const swap2 = Math.floor(Math.random() * (labels.length - 1));
          if (swap1 === swap2) {
            --i;
            continue;
          }
          [labelSwap[swap1], labelSwap[swap2]] = [labelSwap[swap2], labelSwap[swap1]];
          // [resultSwap[swap1], resultSwap[swap2]] = [resultSwap[swap2], resultSwap[swap1]];
        }
      }
    } else if (labels.length === 2) {
      for (let i = 0; i < numOfSwap; ++i) {
        swapList.push([0]);
        lineLength += cellHeight;
      }
    }

    canvas.width = padding * labels.length - padding + fontSize * 1.5;
    canvas.height = labelWidth + resultWidth + lineLength;

    ctx = canvas.getContext('2d');

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'black';

    ctx.beginPath();
    for (let i = 0; i < labels.length; ++i) {
      ctx.moveTo(padding * i + fontSize / 2, labelWidth);
      ctx.lineTo(padding * i + fontSize / 2, labelWidth + lineLength);
    }
    if (labels.length > 1) {
      swapList.forEach((list, i) => {
        list.forEach(swap => {
          ctx.moveTo(padding * swap + fontSize / 2, labelWidth + (i + 0.5) * cellHeight);
          ctx.lineTo(padding * (swap + 1) + fontSize / 2, labelWidth + (i + 0.5) * cellHeight);
        });
      });
    }
    ctx.stroke();

    ctx.font = font;
    ctx.textAlign = 'left';
    ctx.save();
    ctx.rotate(Math.PI / 2);

    labels.forEach((v, groupIdx) => {
      ctx.fillText(labels[labelSwap[groupIdx]], 0, -padding * groupIdx - fontSize / 3);
    });
    resultSwap.forEach((v, groupIdx) => {
      ctx.fillText(results[labelSwap[v]], labelWidth + lineLength + 5, -padding * groupIdx - fontSize / 3);
    });

    ctx.restore();
  }
})();
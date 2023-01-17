import buildCheckboxes from "./buildCheckboxes.js";

const tableArea = document.getElementById("table-area");
const checkBoxArea = document.getElementById("checkboxes-area");
const buildButton = document.getElementById("build-button");
const copyButtonArea = document.getElementById("copy-button-area");
const includeChapterBlurbsCheckbox = document.getElementById("chapter-blurbs");
const branch = "published/"; // should end with slash
const blurbs = {};
const garbage = {};
const bookList = {
  dn: "Dīgha Nikaya",
  mn: "Majjhima Nikāya",
  sn: "Saṁyutta Nikaya",
  an: "Aṅguttara Nikāya",
  kp: "Khuddakapātha",
  ud: "Udāna",
  iti: "Itivuttka",
  snp: "Sutta Nipāta",
  vv: "Vimāna Vatthu",
  pv: "Peta Vatthu",
  ja: "Jātaka",
};

const bookKeys = Object.keys(bookList);
const bookBlurbResponses = [];

buildCheckboxes(checkBoxArea, bookList, bookKeys, copyButtonArea);

buildButton.addEventListener("click", e => {
  let checkboxes = document.querySelectorAll('input[name="books"]:checked');
  let selectedBooks = [];
  checkboxes.forEach(checkbox => {
    selectedBooks.push(checkbox.value);
  });
  fetchBlurbs(selectedBooks);
});

function fetchBlurbs(selectedBooks) {
  if (selectedBooks.length === 0) {
    tableArea.innerHTML = `<p>Please select at least one book</p>`;
    return;
  }
  for (let x = 0; x < selectedBooks.length; x++) {
    const githubLocation = `https://raw.githubusercontent.com/suttacentral/bilara-data/${branch}root/en/blurb/${selectedBooks[x]}-blurbs_root-en.json`;
    bookBlurbResponses[x] = fetch(githubLocation)
      .then(response => response.json())
      // .then(data => console.log(data))
      .catch(error => {
        console.log("something went wrong getting---root---");
        console.log(error);
        console.log(`${githubLocation}`);
      });
  }

  Promise.all(bookBlurbResponses).then(responses => {
    Object.keys(blurbs).forEach(key => delete blurbs[key]);
    Object.keys(garbage).forEach(key => delete garbage[key]);
    for (let x = 0; x < selectedBooks.length; x++) {
      const blurbsObject = responses[x];
      const blurbKeys = Object.keys(blurbsObject);
      for (let a = 0; a < blurbKeys.length; a++) {
        const finalKey = blurbKeys[a].replace(/.+?:/, "");
        if (includeChapterBlurbsCheckbox.checked) {
          blurbs[finalKey] = blurbsObject[blurbKeys[a]];
        } else {
          if (!/-[a-zA-Z]/.test(finalKey)) {
            blurbs[finalKey] = blurbsObject[blurbKeys[a]];
          } else {
            garbage[finalKey] = blurbsObject[blurbKeys[a]];
          }
        }
      }
    }
    outputToScreen(blurbs);

    // COPY BUTTON
    copyButtonArea.innerHTML = `<button id="copy-button">Copy</button>`;
    const copyButton = document.getElementById("copy-button");
    copyButton.addEventListener("click", () => {
      navigator.clipboard.writeText(JSON.stringify(blurbs, null, "\t"));
    });
  });
}

function outputToScreen(blurbs) {
  const blurbKeys = Object.keys(blurbs);
  let table = `<table>
    <thead>
    <tr>
        <th>UID</th>
        <th>Blurb</th>
    </tr>
</thead>
<tbody>`;

  for (let x = 0; x < blurbKeys.length; x++) {
    table += `<tr>
    <td>${blurbKeys[x]}</td>
    <td>${blurbs[blurbKeys[x]] ? blurbs[blurbKeys[x]] : `<b class="no-blurb">THERE IS NO BLURB HERE</B>`}</td>
</tr>`;
  }

  table += `</tbody>
</table>`;

  tableArea.innerHTML = table;
}

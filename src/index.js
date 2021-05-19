import 'bootstrap/dist/css/bootstrap.min.css';
import { Tooltip, Toast, Modal } from 'bootstrap';
import isUrl from 'is-url-superb'
import ClipboardJS from 'clipboard'
import confetti from 'canvas-confetti';

const shortLinkRow = document.querySelector('#shortLinkRow');
const urlForm = document.querySelector('#url-form');
const urlField = document.querySelector('#url');
const spinner = document.querySelector('.spinner');

const bitlyURL = import.meta.env.SNOWPACK_PUBLIC_BITLY_API_SHORTEN_URL;
const accessToken = import.meta.env.SNOWPACK_PUBLIC_BITLY_API_TOKEN;

let envModal = new Modal(document.getElementById('envModal'), {})

urlForm.addEventListener('submit', e => {
  e.preventDefault();
  
  removeResultSet()

  if (!checkEnvVariables()) {
    envModal.show();
    return;
  };
  
  if (!isUrl(urlField.value)) {
    urlField.classList.add('is-invalid');
    return;
  }
  
  spinner.classList.remove('d-none');
  spinner.setAttribute('disabled', true)

  fetch(bitlyURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      long_url: urlField.value
    })
  })
  .then(response => response.json())
  .then(data => {
    const { link } = data
    spinner.classList.add('d-none');
    spinner.removeAttribute('disabled')
    populateShortLink(link);
  })
  .catch(e => console.log(e))
});

urlField.addEventListener('keyup', removeErrorField)

const checkEnvVariables = () => {
  return bitlyURL && accessToken
}

function populateShortLink(shortUrl) {
  const result = `
    <div class="col">
      <div
        style="background: #e7f3ed"
        class="rounded-3 mt-3 py-4 px-4"
      >
        <h2 class="text-success fs-4 mb-4 text-center">
          Your URL has been generated
        </h2>
        <div class="input-group">
          <input
            id="shortUrl"
            type="text"
            class="form-control bg-white p-3"
            placeholder="https://google.com"
            value="${shortUrl}"
            aria-label="Recipient's username"
            aria-describedby="button-copy"
            readonly
          />
          <button
            class="btn btn-primary d-flex align-items-center"
            type="button"
            id="button-copy"
            data-clipboard-target="#shortUrl"
            data-bs-toggle="tooltip" 
            data-bs-placement="top" 
            title="Copy to Clipboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-clipboard"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
          </button>
          <a
            href="${shortUrl}"
            target="_blank"
            class="btn btn-warning d-flex align-items-center"
            type="button"
            id="button-copy"
            data-bs-toggle="tooltip" 
            data-bs-placement="top" 
            title="Open link in new Tab"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-external-link"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </a>
        </div>
      </div>
    </div>
  `;

  let shortUrlRow = document.createElement('div');
  shortUrlRow.classList.add('results', 'row', 'mt-3');
  shortUrlRow.innerHTML = result;
  shortLinkRow.insertAdjacentElement('beforeend', shortUrlRow);
  fireConfetti()
  initializeResultComponents()
}

function removeErrorField() {
  if (urlField.classList.contains('is-invalid'))
    urlField.classList.remove('is-invalid')  
}

function fireConfetti() {
  confetti.create(document.getElementById('canvas'), {
    resize: true,
    useWorker: true,
  })({ particleCount: 100, spread: 100 });
}

function initializeResultComponents() {
  
  let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new Tooltip(tooltipTriggerEl)
  })

  let toast = document.querySelector('#successToast');
  let successToast = new Toast(toast, {})

  const clipboard = new ClipboardJS('#button-copy');
  clipboard.on('success', function(e) {
    successToast.show()
  })
}

function removeResultSet() {
  [...document.querySelectorAll('.results')]
    .map(result => result && result.remove())
}

function resetEverything() {
  urlField.value = '';
  removeErrorField();
  removeResultSet()
}

document.querySelector('#resetResults').addEventListener('click', resetEverything)
// Toggle between English and Portuguese sections using the button in the nav.
document.addEventListener('DOMContentLoaded', () => {
	const enSection = document.getElementById('english_content');
	const ptSection = document.getElementById('portuguese_content');
	const btn = document.getElementById('translateBtn');
	const enSpan = document.querySelector('.translation .en');
	const ptSpan = document.querySelector('.translation .pt');

	if (!enSection || !ptSection || !btn) return; // nothing to do

	// current language state: 'en' or 'pt'
	let lang = 'en';

	function updateUI() {
		if (lang === 'en') {
			enSection.style.display = '';
			ptSection.style.display = 'none';
			btn.textContent = 'Português';
			btn.setAttribute('aria-pressed', 'false');
			if (enSpan) enSpan.style.fontWeight = '700';
			if (ptSpan) ptSpan.style.fontWeight = '400';
			enSection.setAttribute('aria-hidden', 'false');
			ptSection.setAttribute('aria-hidden', 'true');
		} else {
			enSection.style.display = 'none';
			ptSection.style.display = '';
			btn.textContent = 'English';
			btn.setAttribute('aria-pressed', 'true');
			if (enSpan) enSpan.style.fontWeight = '400';
			if (ptSpan) ptSpan.style.fontWeight = '700';
			enSection.setAttribute('aria-hidden', 'true');
			ptSection.setAttribute('aria-hidden', 'false');
		}
	}

	// initialize: show English only
	updateUI();

	btn.addEventListener('click', () => {
		lang = lang === 'en' ? 'pt' : 'en';
		updateUI();
	});

	// make the EN / PT labels clickable as quick toggles
	if (enSpan) {
		enSpan.style.cursor = 'pointer';
		enSpan.addEventListener('click', () => { lang = 'en'; updateUI(); });
	}
	if (ptSpan) {
		ptSpan.style.cursor = 'pointer';
		ptSpan.addEventListener('click', () => { lang = 'pt'; updateUI(); });
	}
});


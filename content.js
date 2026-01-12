(function () {
	const LANG_MAP = {
		'ja': {
			forYou: 'おすすめ',
			following: 'フォロー中',
			popular: '人気',
			latest: '最新'
		},
		'en': {
			forYou: 'For you',
			following: 'Following',
			popular: 'Popular',
			latest: 'Latest'
		},
		'es': {
			forYou: 'Para ti',
			following: 'Siguiendo',
			popular: 'Popular',
			latest: 'Reciente'
		},
		'fr': {
			forYou: 'Pour vous',
			following: 'Abonnements',
			popular: 'Populaire',
			latest: 'Récent'
		},
		'pt': {
			forYou: 'Para você',
			following: 'Seguindo',
			popular: 'Popular',
			latest: 'Recente'
		}
	};

	const getLanguage = () => {
		const lang = document.documentElement.lang || navigator.language || 'en';
		return lang.split('-')[0];
	};

	const getLabels = () => {
		const langCode = getLanguage();
		return LANG_MAP[langCode] || LANG_MAP['en'];
	};

	let isProcessing = false;
	let latestSortSelected = false;
	let dropdownHidden = false;

	// フォロー中タブのドロップダウンを無効化し、クリックで最新読み込み
	const setupFollowingTab = () => {
		if (dropdownHidden) return;

		const { following } = getLabels();
		const tabs = document.querySelectorAll('div[role="tab"]');

		for (const tab of tabs) {
			const text = tab.textContent.trim();
			if (text.toLowerCase().includes(following.toLowerCase())) {
				// ドロップダウン矢印（SVG）を非表示
				const svg = tab.querySelector('svg');
				if (svg) {
					svg.style.display = 'none';
				}
				// ドロップダウン機能を無効化
				tab.removeAttribute('aria-haspopup');

				// クリックイベントを設定（ドロップダウン防止 + 最新読み込み）
				if (!tab.dataset.customClickAdded) {
					tab.dataset.customClickAdded = 'true';

					// capture phaseでドロップダウンを防ぐ
					tab.addEventListener('click', (e) => {
						e.stopPropagation();
						e.preventDefault();

						// 最新ツイートを読み込む
						const showPostsButton = document.querySelector('[data-testid="cellInnerDiv"] button');
						if (showPostsButton && showPostsButton.textContent.includes('件')) {
							showPostsButton.click();
						} else {
							// なければタイムラインの一番上にスクロール
							window.scrollTo({ top: 0, behavior: 'smooth' });
						}
					}, true);
				}

				dropdownHidden = true;
				break;
			}
		}
	};

	const removeForYouAndSelectFollowing = () => {
		if (isProcessing) return;
		isProcessing = true;

		try {
			const { forYou, following } = getLabels();
			const navTabs = document.querySelectorAll('div[role="tablist"] div[role="tab"]');
			let selectFollowing = false;

			navTabs.forEach(tab => {
				const label = tab.textContent.trim();

				if (label.toLowerCase() === forYou.toLowerCase()) {
					const parent = tab.closest('div[role="presentation"]');
					const isSelected = tab.getAttribute('aria-selected') === 'true';
					if (parent) {
						if (isSelected) selectFollowing = true;
						parent.remove();
					}
				}
			});

			if (selectFollowing) {
				const remainingTabs = document.querySelectorAll('div[role="tablist"] div[role="tab"]');
				remainingTabs.forEach(tab => {
					const label = tab.textContent.trim();
					if (label.toLowerCase().includes(following.toLowerCase())) {
						tab.click();
						latestSortSelected = false;
					}
				});
			}
		} finally {
			isProcessing = false;
		}
	};

	const selectLatestSort = () => {
		if (latestSortSelected || isProcessing) return;

		const { latest } = getLabels();

		// roleがmenuitemの要素を全て検索（div以外も含む）
		const menuItems = document.querySelectorAll('[role="menuitem"]');
		menuItems.forEach(item => {
			const label = item.textContent.trim();
			if (label.toLowerCase() === latest.toLowerCase()) {
				item.click();
				latestSortSelected = true;
			}
		});
	};

	const clickSortDropdown = () => {
		if (latestSortSelected) return;

		const { following, popular, latest } = getLabels();

		// 新UI: フォロー中タブ自体がドロップダウントリガー
		const tabs = document.querySelectorAll('div[role="tab"]');
		for (const tab of tabs) {
			const ariaHaspopup = tab.getAttribute('aria-haspopup');
			const text = tab.textContent.trim();
			if (ariaHaspopup === 'menu' && text.toLowerCase().includes(following.toLowerCase())) {
				tab.click();
				setTimeout(selectLatestSort, 100);
				return;
			}
		}

		// 旧UI: 別の並べ替えボタンがある場合
		const sortButtons = document.querySelectorAll('div[role="button"]');
		sortButtons.forEach(button => {
			const ariaHaspopup = button.getAttribute('aria-haspopup');
			const text = button.textContent.trim();

			if (ariaHaspopup === 'menu' &&
				(text.includes(popular) || text.includes(latest) || text.includes('並べ替え') || text.includes('Sort'))) {
				button.click();
				setTimeout(selectLatestSort, 100);
			}
		});
	};

	const waitForTabs = () => {
		const tabsExist = document.querySelectorAll('a[role="tab"]').length > 0 ||
			document.querySelectorAll('div[role="tab"]').length > 0;
		if (tabsExist) {
			removeForYouAndSelectFollowing();
			setTimeout(() => {
				clickSortDropdown();
				// 最新選択後にタブをセットアップ
				setTimeout(setupFollowingTab, 300);
			}, 500);
		} else {
			setTimeout(waitForTabs, 500);
		}
	};

	waitForTabs();

	let debounceTimer = null;
	const observer = new MutationObserver(() => {
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			removeForYouAndSelectFollowing();
			if (!latestSortSelected) {
				clickSortDropdown();
			}
			setupFollowingTab();
		}, 100);
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true
	});

	window.addEventListener('popstate', () => {
		latestSortSelected = false;
		setTimeout(() => {
			removeForYouAndSelectFollowing();
			clickSortDropdown();
		}, 500);
	});
})();

(() => {
  'use strict';

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation');

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      form.classList.add('was-validated');
    }, false);
  });

  window.closeUserDropdown = function () { };

  // ============================================================
  // Airbnb 3-Segment Search Bar & Popovers Interactive Logic
  // ============================================================
  document.addEventListener('DOMContentLoaded', () => {
    const searchBarContainer = document.getElementById('searchBarContainer');
    if (!searchBarContainer) return;

    // Segments
    const segWhere = document.getElementById('segWhere');
    const segWhen = document.getElementById('segWhen');
    const segWho = document.getElementById('segWho');

    // Popovers
    const wherePopover = document.getElementById('wherePopover');
    const whenPopover = document.getElementById('whenPopover');
    const whoPopover = document.getElementById('whoPopover');

    // Hidden form inputs
    const searchWhereInput = document.getElementById('searchWhereInput');
    const searchCheckInInput = document.getElementById('searchCheckInInput');
    const searchCheckOutInput = document.getElementById('searchCheckOutInput');
    const searchGuestsInput = document.getElementById('searchGuestsInput');

    // Subtext displays
    const segWhereText = document.getElementById('segWhereText');
    const segWhenText = document.getElementById('segWhenText');
    const segWhoText = document.getElementById('segWhoText');

    const allSegments = [segWhere, segWhen, segWho];
    const allPopovers = [wherePopover, whenPopover, whoPopover];

    function closeAllPopovers() {
      allPopovers.forEach(p => p && p.classList.remove('show'));
      allSegments.forEach(s => s && s.classList.remove('active'));
    }

    function openPopover(segment, popover) {
      const isAlreadyOpen = popover && popover.classList.contains('show');
      closeAllPopovers();
      closeUserDropdown();
      if (!isAlreadyOpen && popover && segment) {
        popover.classList.add('show');
        segment.classList.add('active');
      }
    }

    // Toggle popovers when segments are clicked
    if (segWhere) {
      segWhere.addEventListener('click', (e) => {
        e.stopPropagation();
        openPopover(segWhere, wherePopover);
      });
    }

    if (segWhen) {
      segWhen.addEventListener('click', (e) => {
        e.stopPropagation();
        openPopover(segWhen, whenPopover);
      });
    }

    if (segWho) {
      segWho.addEventListener('click', (e) => {
        e.stopPropagation();
        openPopover(segWho, whoPopover);
      });
    }

    // Prevent popover clicks from bubbling to document (which would close them)
    allPopovers.forEach(p => {
      if (p) {
        p.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      }
    });

    // Document click closes all popovers
    document.addEventListener('click', () => {
      closeAllPopovers();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllPopovers();
      }
    });

    // Close button on Where popover
    const closeWhereBtn = document.getElementById('closeWhereBtn');
    if (closeWhereBtn) {
      closeWhereBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllPopovers();
      });
    }

    // ------------------------------------------------------------
    // 1. Where Selection: Manual City Typing & Destination Items
    // ------------------------------------------------------------
    const popoverCityInput = document.getElementById('popoverCityInput');
    const clearCityBtn = document.getElementById('clearCityBtn');
    const manualSearchOption = document.getElementById('manualSearchOption');
    const manualSearchOptionTitle = document.getElementById('manualSearchOptionTitle');
    const destinationItems = document.querySelectorAll('#destinationList .destination-item');

    function filterDestinations(query) {
      const q = (query || '').trim().toLowerCase();

      // Toggle clear button
      if (clearCityBtn) {
        clearCityBtn.style.display = q.length > 0 ? 'inline-block' : 'none';
      }

      // Show 'Search for [typed city]' prompt if query has content
      if (manualSearchOption && manualSearchOptionTitle) {
        if (q.length > 0) {
          manualSearchOptionTitle.textContent = `Search for "${(query || '').trim()}"`;
          manualSearchOption.style.display = 'flex';
          manualSearchOption.setAttribute('data-val', (query || '').trim());
        } else {
          manualSearchOption.style.display = 'none';
        }
      }

      // Filter suggested destination items
      destinationItems.forEach(item => {
        const val = (item.getAttribute('data-val') || '').toLowerCase();
        const text = item.textContent.toLowerCase();
        if (!q || val.includes(q) || text.includes(q)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    }

    // Set city value across inputs and optionally advance to 'When' popover
    function setCityValue(cityStr, advanceToWhen = false) {
      const trimmed = (cityStr || '').trim();
      if (searchWhereInput) searchWhereInput.value = trimmed;
      if (popoverCityInput) popoverCityInput.value = trimmed;
      filterDestinations(trimmed);

      if (advanceToWhen) {
        openPopover(segWhen, whenPopover);
      }
    }

    if (searchWhereInput) {
      searchWhereInput.addEventListener('focus', () => {
        openPopover(segWhere, wherePopover);
        if (popoverCityInput && searchWhereInput.value) {
          popoverCityInput.value = searchWhereInput.value;
          filterDestinations(searchWhereInput.value);
        }
      });
      searchWhereInput.addEventListener('input', (e) => {
        if (popoverCityInput) popoverCityInput.value = e.target.value;
        filterDestinations(e.target.value);
        if (wherePopover && !wherePopover.classList.contains('show')) {
          openPopover(segWhere, wherePopover);
        }
      });
      searchWhereInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          if (searchWhereInput.value.trim()) {
            setCityValue(searchWhereInput.value.trim(), true);
            e.preventDefault();
          }
        }
      });
    }

    if (popoverCityInput) {
      popoverCityInput.addEventListener('input', (e) => {
        if (searchWhereInput) searchWhereInput.value = e.target.value;
        filterDestinations(e.target.value);
      });
      popoverCityInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (popoverCityInput.value.trim()) {
            setCityValue(popoverCityInput.value.trim(), true);
          }
        }
      });
    }

    if (clearCityBtn) {
      clearCityBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setCityValue('');
        if (popoverCityInput) popoverCityInput.focus();
        else if (searchWhereInput) searchWhereInput.focus();
      });
    }

    if (manualSearchOption) {
      manualSearchOption.addEventListener('click', (e) => {
        e.stopPropagation();
        const city = manualSearchOption.getAttribute('data-val') || (popoverCityInput ? popoverCityInput.value : '');
        if (city) {
          setCityValue(city, true);
        }
      });
    }

    destinationItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = item.getAttribute('data-val');
        if (val) {
          setCityValue(val, true);
        }
      });
    });

    // Initial sync if city is already in searchWhereInput
    if (searchWhereInput && searchWhereInput.value) {
      if (popoverCityInput) popoverCityInput.value = searchWhereInput.value;
      filterDestinations(searchWhereInput.value);
    }

    // ------------------------------------------------------------
    // 2. When Selection: Date Pickers & Calendar
    // ------------------------------------------------------------
    const popoverCheckInInput = document.getElementById('popoverCheckInInput');
    const popoverCheckOutInput = document.getElementById('popoverCheckOutInput');

    function formatDateRange(d1Str, d2Str) {
      if (!d1Str || !d2Str) return 'Add dates';
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
      const d1 = new Date(d1Str);
      const d2 = new Date(d2Str);
      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return `${d1Str} – ${d2Str}`;

      const m1 = months[d1.getMonth()];
      const m2 = months[d2.getMonth()];
      const day1 = d1.getDate();
      const day2 = d2.getDate();

      if (m1 === m2) {
        return `${day1} – ${day2} ${m1}`;
      }
      return `${day1} ${m1} – ${day2} ${m2}`;
    }

    function updateDateSelection() {
      if (!popoverCheckInInput || !popoverCheckOutInput) return;
      const inVal = popoverCheckInInput.value;
      const outVal = popoverCheckOutInput.value;

      if (searchCheckInInput) searchCheckInInput.value = inVal;
      if (searchCheckOutInput) searchCheckOutInput.value = outVal;

      if (segWhenText) {
        if (inVal && outVal) {
          segWhenText.textContent = formatDateRange(inVal, outVal);
          segWhenText.classList.add('has-val');
        } else if (inVal) {
          segWhenText.textContent = formatSingleDate(inVal) + ' – ...';
          segWhenText.classList.add('has-val');
        } else {
          segWhenText.textContent = 'Add dates';
          segWhenText.classList.remove('has-val');
        }
      }
    }

    function formatSingleDate(dStr) {
      if (!dStr) return '';
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return dStr;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
      return `${d.getDate()} ${months[d.getMonth()]}`;
    }

    // ============================================================
    // Single Unified Calendar Engine: First click = Check-in, Second = Checkout
    // ============================================================
    const singleCalGrid = document.getElementById('singleCalGrid');
    const calMonthYearTitle = document.getElementById('calMonthYearTitle');
    const calPrevMonthBtn = document.getElementById('calPrevMonthBtn');
    const calNextMonthBtn = document.getElementById('calNextMonthBtn');
    const calStepBadge = document.getElementById('calStepBadge');

    let currentCalDate = new Date();
    if (popoverCheckInInput && popoverCheckInInput.value) {
      const parsed = new Date(popoverCheckInInput.value);
      if (!isNaN(parsed.getTime())) currentCalDate = parsed;
    }

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    function renderCalendar() {
      if (!singleCalGrid) return;
      singleCalGrid.innerHTML = '';

      const year = currentCalDate.getFullYear();
      const month = currentCalDate.getMonth();

      if (calMonthYearTitle) {
        calMonthYearTitle.textContent = `${monthNames[month]} ${year}`;
      }

      const firstDayIndex = new Date(year, month, 1).getDay();
      const totalDays = new Date(year, month + 1, 0).getDate();

      // Empty padding cells before first day
      for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('span');
        emptyCell.className = 'cal-day-cell empty';
        singleCalGrid.appendChild(emptyCell);
      }

      const curIn = popoverCheckInInput ? popoverCheckInInput.value : '';
      const curOut = popoverCheckOutInput ? popoverCheckOutInput.value : '';

      for (let day = 1; day <= totalDays; day++) {
        const cell = document.createElement('span');
        cell.className = 'cal-day-cell';
        const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        cell.setAttribute('data-date', dStr);
        cell.textContent = day;

        if (dStr === curIn || dStr === curOut) {
          cell.classList.add('selected');
        } else if (curIn && curOut && dStr > curIn && dStr < curOut) {
          cell.classList.add('in-range');
        }

        cell.addEventListener('click', () => handleDateClick(dStr));
        singleCalGrid.appendChild(cell);
      }

      updateStepBadge();
    }

    function updateStepBadge() {
      if (!calStepBadge) return;
      const curIn = popoverCheckInInput ? popoverCheckInInput.value : '';
      const curOut = popoverCheckOutInput ? popoverCheckOutInput.value : '';

      if (!curIn) {
        calStepBadge.textContent = 'Step 1: Select check-in date';
        calStepBadge.className = 'badge rounded-pill bg-light text-dark border px-3 py-1';
      } else if (!curOut) {
        calStepBadge.textContent = `Step 2: Select checkout date (after ${formatSingleDate(curIn)})`;
        calStepBadge.className = 'badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle px-3 py-1';
      } else {
        calStepBadge.textContent = `${formatDateRange(curIn, curOut)}`;
        calStepBadge.className = 'badge rounded-pill bg-dark text-white border px-3 py-1';
      }
    }

    function handleDateClick(dateStr) {
      const curIn = popoverCheckInInput ? popoverCheckInInput.value : '';
      const curOut = popoverCheckOutInput ? popoverCheckOutInput.value : '';

      // First click: no checkin set, or both already set -> start fresh with new checkin
      if (!curIn || (curIn && curOut)) {
        if (popoverCheckInInput) popoverCheckInInput.value = dateStr;
        if (popoverCheckOutInput) popoverCheckOutInput.value = '';
        updateDateSelection();
        renderCalendar();
        return;
      }

      // Second click: checkin is set, now picking checkout
      if (curIn && !curOut) {
        const d1 = new Date(curIn);
        const d2 = new Date(dateStr);

        if (d2 > d1) {
          if (popoverCheckOutInput) popoverCheckOutInput.value = dateStr;
          updateDateSelection();
          renderCalendar();

          // Progress to Who popover automatically
          setTimeout(() => {
            openPopover(segWho, whoPopover);
          }, 350);
        } else {
          // Clicked earlier or equal date: reset checkin to clicked date
          if (popoverCheckInInput) popoverCheckInInput.value = dateStr;
          if (popoverCheckOutInput) popoverCheckOutInput.value = '';
          updateDateSelection();
          renderCalendar();
        }
      }
    }

    // Month Navigation Controls
    if (calPrevMonthBtn) {
      calPrevMonthBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentCalDate.setMonth(currentCalDate.getMonth() - 1);
        renderCalendar();
      });
    }

    if (calNextMonthBtn) {
      calNextMonthBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentCalDate.setMonth(currentCalDate.getMonth() + 1);
        renderCalendar();
      });
    }

    if (popoverCheckInInput) {
      popoverCheckInInput.addEventListener('change', () => {
        updateDateSelection();
        if (popoverCheckInInput.value) {
          const parsed = new Date(popoverCheckInInput.value);
          if (!isNaN(parsed.getTime())) currentCalDate = parsed;
        }
        renderCalendar();
      });
    }

    if (popoverCheckOutInput) {
      popoverCheckOutInput.addEventListener('change', () => {
        updateDateSelection();
        renderCalendar();
      });
    }

    // Initialize calendar
    renderCalendar();
    updateDateSelection();

    // Flexible Date Chips
    const flexChips = document.querySelectorAll('.date-flex-chip');
    flexChips.forEach(chip => {
      chip.addEventListener('click', () => {
        flexChips.forEach(c => c.classList.remove('active', 'btn-outline-dark'));
        flexChips.forEach(c => c.classList.add('btn-outline-secondary'));
        chip.classList.add('active', 'btn-outline-dark');
        chip.classList.remove('btn-outline-secondary');
      });
    });

    // ------------------------------------------------------------
    // 3. Who Selection: Steppers for Adults, Children, Infants, Pets
    // ------------------------------------------------------------
    let adultCount = 1;
    let childCount = 0;
    let infantCount = 0;
    let petCount = 0;

    const btnAdultMinus = document.getElementById('btnAdultMinus');
    const btnAdultPlus = document.getElementById('btnAdultPlus');
    const txtAdultCount = document.getElementById('txtAdultCount');

    const btnChildMinus = document.getElementById('btnChildMinus');
    const btnChildPlus = document.getElementById('btnChildPlus');
    const txtChildCount = document.getElementById('txtChildCount');

    const btnInfantMinus = document.getElementById('btnInfantMinus');
    const btnInfantPlus = document.getElementById('btnInfantPlus');
    const txtInfantCount = document.getElementById('txtInfantCount');

    const btnPetMinus = document.getElementById('btnPetMinus');
    const btnPetPlus = document.getElementById('btnPetPlus');
    const txtPetCount = document.getElementById('txtPetCount');

    function updateWhoDisplay() {
      const totalGuests = adultCount + childCount;
      if (searchGuestsInput) searchGuestsInput.value = totalGuests;

      if (segWhoText) {
        let label = `${totalGuests} guest${totalGuests > 1 ? 's' : ''}`;
        if (infantCount > 0) {
          label += `, ${infantCount} infant${infantCount > 1 ? 's' : ''}`;
        }
        if (petCount > 0) {
          label += `, ${petCount} pet${petCount > 1 ? 's' : ''}`;
        }
        segWhoText.textContent = label;
        segWhoText.classList.add('has-val');
      }

      if (txtAdultCount) txtAdultCount.textContent = adultCount;
      if (txtChildCount) txtChildCount.textContent = childCount;
      if (txtInfantCount) txtInfantCount.textContent = infantCount;
      if (txtPetCount) txtPetCount.textContent = petCount;

      if (btnAdultMinus) btnAdultMinus.disabled = (adultCount <= 1);
      if (btnChildMinus) btnChildMinus.disabled = (childCount <= 0);
      if (btnInfantMinus) btnInfantMinus.disabled = (infantCount <= 0);
      if (btnPetMinus) btnPetMinus.disabled = (petCount <= 0);
    }

    if (btnAdultMinus) {
      btnAdultMinus.addEventListener('click', () => {
        if (adultCount > 1) {
          adultCount--;
          updateWhoDisplay();
        }
      });
    }

    if (btnAdultPlus) {
      btnAdultPlus.addEventListener('click', () => {
        if (adultCount < 16) {
          adultCount++;
          updateWhoDisplay();
        }
      });
    }

    if (btnChildMinus) {
      btnChildMinus.addEventListener('click', () => {
        if (childCount > 0) {
          childCount--;
          updateWhoDisplay();
        }
      });
    }

    if (btnChildPlus) {
      btnChildPlus.addEventListener('click', () => {
        if (childCount < 10) {
          childCount++;
          updateWhoDisplay();
        }
      });
    }

    if (btnInfantMinus) {
      btnInfantMinus.addEventListener('click', () => {
        if (infantCount > 0) {
          infantCount--;
          updateWhoDisplay();
        }
      });
    }

    if (btnInfantPlus) {
      btnInfantPlus.addEventListener('click', () => {
        if (infantCount < 5) {
          infantCount++;
          updateWhoDisplay();
        }
      });
    }

    if (btnPetMinus) {
      btnPetMinus.addEventListener('click', () => {
        if (petCount > 0) {
          petCount--;
          updateWhoDisplay();
        }
      });
    }

    if (btnPetPlus) {
      btnPetPlus.addEventListener('click', () => {
        if (petCount < 5) {
          petCount++;
          updateWhoDisplay();
        }
      });
    }

    // Initial run
    updateDateSelection();
  });

  // ============================================================
  // Right-side User Profile Dropdown Menu Logic (All Pages)
  // ============================================================
  function initUserProfileMenu() {
    const userProfileMenuBtn = document.getElementById('userProfileMenuBtn');
    const userDropdownMenu = document.getElementById('userDropdownMenu');

    window.closeUserDropdown = function () {
      if (userDropdownMenu) {
        userDropdownMenu.classList.remove('show');
      }
      if (userProfileMenuBtn) {
        userProfileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    };

    if (userProfileMenuBtn && userDropdownMenu) {
      userProfileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Close search popovers if any open
        const allPopovers = document.querySelectorAll('.search-popover.show');
        allPopovers.forEach(p => p.classList.remove('show'));
        const allSegments = document.querySelectorAll('.search-segment.active');
        allSegments.forEach(s => s.classList.remove('active'));

        const willOpen = !userDropdownMenu.classList.contains('show');
        if (willOpen) {
          userDropdownMenu.classList.add('show');
          userProfileMenuBtn.setAttribute('aria-expanded', 'true');
        } else {
          userDropdownMenu.classList.remove('show');
          userProfileMenuBtn.setAttribute('aria-expanded', 'false');
        }
      });

      userDropdownMenu.addEventListener('click', (e) => {
        // Prevent theme selector clicks from bubbling or closing the menu
        if (e.target.closest('#themeSelectorContainer')) {
          e.stopPropagation();
          return;
        }
        // Allow links and buttons to be clicked, stop other clicks from bubbling
        if (e.target.tagName !== 'A' && !e.target.closest('a') && e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
          e.stopPropagation();
        }
      });

      document.addEventListener('click', (e) => {
        if (userDropdownMenu.classList.contains('show')) {
          if (!userDropdownMenu.contains(e.target) && !userProfileMenuBtn.contains(e.target)) {
            window.closeUserDropdown();
          }
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          window.closeUserDropdown();
        }
      });
    }
  }

  // ============================================================
  // Theme Controller: White Mode & Dark Mode Options
  // ============================================================
  function initThemeController() {
    const themeOptLight = document.getElementById('themeOptLight');
    const themeOptDark = document.getElementById('themeOptDark');
    const themeOptionsGroup = document.getElementById('themeOptionsGroup');
    const themeHeaderRow = document.getElementById('themeHeaderRow');
    const currentThemeBadge = document.getElementById('currentThemeBadge');
    const navThemeToggleBtn = document.getElementById('navThemeToggleBtn');
    const navThemeIcon = document.getElementById('navThemeIcon');

    function syncThemeUI(isDark) {
      if (themeOptLight) {
        themeOptLight.classList.toggle('active', !isDark);
      }
      if (themeOptDark) {
        themeOptDark.classList.toggle('active', isDark);
      }
      if (currentThemeBadge) {
        currentThemeBadge.textContent = isDark ? 'Dark Mode' : 'White Mode';
        if (isDark) {
          currentThemeBadge.className = 'badge rounded-pill bg-dark text-white border border-secondary px-2 py-1';
        } else {
          currentThemeBadge.className = 'badge rounded-pill bg-danger-subtle text-danger border-0 px-2 py-1';
        }
      }
      if (navThemeIcon) {
        navThemeIcon.className = isDark ? 'fa-solid fa-sun fs-5 text-warning' : 'fa-solid fa-moon fs-5 text-dark';
      }
      if (navThemeToggleBtn) {
        navThemeToggleBtn.title = isDark ? 'Switch to White Mode' : 'Switch to Dark Mode';
      }
    }

    function setTheme(theme) {
      const isDark = (theme === 'dark');
      if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        try { localStorage.setItem('wanderlust_theme', 'dark'); } catch (e) {}
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        try { localStorage.setItem('wanderlust_theme', 'light'); } catch (e) {}
      }
      syncThemeUI(isDark);
    }

    // Determine current theme state
    const currentTheme = document.documentElement.getAttribute('data-theme') || 
      (function () { try { return localStorage.getItem('wanderlust_theme'); } catch (e) { return 'light'; } })() || 
      'light';
    setTheme(currentTheme);

    // Instant click handler helper to prevent delayed/ghost clicks
    function bindInstantAction(elem, action) {
      if (!elem) return;
      elem.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        action();
      });
    }

    // 1. One-click on White mode button
    bindInstantAction(themeOptLight, () => setTheme('light'));

    // 2. One-click on Dark mode button
    bindInstantAction(themeOptDark, () => setTheme('dark'));

    // 3. One-click on the Appearance header row or badge to toggle
    bindInstantAction(themeHeaderRow, () => {
      const currentIsDark = document.documentElement.getAttribute('data-theme') === 'dark';
      setTheme(currentIsDark ? 'light' : 'dark');
    });

    bindInstantAction(currentThemeBadge, () => {
      const currentIsDark = document.documentElement.getAttribute('data-theme') === 'dark';
      setTheme(currentIsDark ? 'light' : 'dark');
    });

    // 4. One-click on the options capsule
    if (themeOptionsGroup) {
      themeOptionsGroup.addEventListener('click', (e) => {
        e.stopPropagation();
        const clickedBtn = e.target.closest('.theme-btn-option');
        if (clickedBtn) {
          const val = clickedBtn.getAttribute('data-theme-val');
          if (val) setTheme(val);
        } else {
          const rect = themeOptionsGroup.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          setTheme(clickX < rect.width / 2 ? 'light' : 'dark');
        }
      });
    }

    // 5. Navbar quick toggle button
    bindInstantAction(navThemeToggleBtn, () => {
      const currentIsDark = document.documentElement.getAttribute('data-theme') === 'dark';
      setTheme(currentIsDark ? 'light' : 'dark');
    });
  }

  function initApp() {
    initUserProfileMenu();
    initThemeController();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

  // Global Wishlist Toggle Function
  window.toggleWishlistHeart = async function (listingId, btnElem) {
    try {
      const res = await fetch(`/wishlists/toggle/${listingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        const icon = btnElem.querySelector('i');
        if (data.isLiked) {
          icon.classList.remove('fa-regular');
          icon.classList.add('fa-solid', 'text-danger');
          btnElem.title = 'Remove from wishlist';
        } else {
          icon.classList.remove('fa-solid', 'text-danger');
          icon.classList.add('fa-regular');
          btnElem.title = 'Save to wishlist';

          // If on wishlist page, smoothly remove the card
          const card = document.getElementById(`wishlistCard-${listingId}`);
          if (card) {
            card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => card.remove(), 250);
          }
        }

        // Update wishlist count badge in menu
        const badge = document.getElementById('menuWishlistBadge');
        if (badge) {
          badge.textContent = data.count;
          badge.style.display = data.count > 0 ? 'inline-block' : 'none';
        }
      } else if (res.status === 401) {
        alert('Please log in to save places to your Wishlist.');
        window.location.href = '/login';
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    }
  };
})();
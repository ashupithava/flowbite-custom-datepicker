$(document).ready(function () {
    const $datePickerEl = $('#date_picker');
    const $monthPickerEl = $('#month_year_picker');
    const $yearPickerEl = $('#year_picker');
    const $hiddenDateInput = $('#date');
    const $hiddenMonthInput = $('#month');
    const $hiddenYearInput = $('#year');
    const $selectedDateDisplay = $('#selected_date');
    const $selectedMonthDisplay = $('#selected_month');
    const $selectedYearDisplay = $('#selected_year');
    const $selectedValueDisplay = $('#selected_value');

    let activeDatepicker = null;
    let activeClickHandler = null;

    function applySelection(options) {
        const selectedPicker = $('input[name="picker"]:checked').val();
        const { day, month, year } = options;

        if (selectedPicker === 'date' && day && month && year) {
            const monthIndex = month - 1;
            const formattedDate = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;

            $hiddenDateInput.val(day);
            $hiddenMonthInput.val(month);
            $hiddenYearInput.val(year);

            $datePickerEl.val(formattedDate);
            $selectedDateDisplay.text(String(day).padStart(2, '0'));
            $selectedMonthDisplay.text(String(month).padStart(2, '0'));
            $selectedYearDisplay.text(year);
            $selectedValueDisplay.text(formattedDate);

            if (activeDatepicker) {
                activeDatepicker.setDate(new Date(year, monthIndex, day));
            }

        } else if (selectedPicker === 'month' && month && year) {
            const monthIndex = month - 1;
            const formattedMonth = `${String(month).padStart(2, '0')}/${year}`;

            $hiddenMonthInput.val(month);
            $hiddenYearInput.val(year);

            $monthPickerEl.val(formattedMonth);
            $selectedMonthDisplay.text(String(month).padStart(2, '0'));
            $selectedYearDisplay.text(year);
            $selectedValueDisplay.text(formattedMonth);

            if (activeDatepicker) {
                activeDatepicker.setDate(new Date(year, monthIndex, 1));
            }

        } else if (selectedPicker === 'year' && year) {
            $hiddenYearInput.val(year);

            $yearPickerEl.val(String(year));
            $selectedYearDisplay.text(year);
            $selectedValueDisplay.text(year);

            if (activeDatepicker) {
                activeDatepicker.setDate(new Date(year, 0, 1));
            }
        }
    }

    function handleEnterKey(event) {
        const selectedPicker = $('input[name="picker"]:checked').val();
        if (event.key !== 'Enter') {
            return;
        }

        event.preventDefault();
        const $selectedEl = $(event.target);
        const value = $selectedEl.val().trim();
        const now = new Date();
        const currentYear = now.getFullYear();
        const minYear = currentYear - 2;
        const maxYear = currentYear + 5;

        let options = {};

        if (selectedPicker === 'month') {
            const regex = /^(0[1-9]|1[0-2])\/(\d{4})$/;
            if (!regex.test(value)) {
                options = { month: now.getMonth() + 1, year: now.getFullYear() };
            } else {
                const [, mm, yyyy] = value.match(regex);
                let year = parseInt(yyyy, 10);
                const month = parseInt(mm, 10);
                year = Math.min(Math.max(year, minYear), maxYear);
                options = { month: month, year: year };
            }

        } else if (selectedPicker === 'year') {
            const regex = /^(\d{4})$/;
            if (!regex.test(value)) {
                options = { year: now.getFullYear() };
            } else {
                let year = parseInt(value, 10);
                year = Math.min(Math.max(year, minYear), maxYear);
                options = { year: year };
            }

        } else { 
            const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(\d{4})$/;
            if (!regex.test(value)) {
                options = { day: now.getDate(), month: now.getMonth() + 1, year: now.getFullYear() };
            } else {
                const [, dd, mm, yyyy] = value.match(regex);
                let year = parseInt(yyyy, 10);
                const day = parseInt(dd, 10);
                const month = parseInt(mm, 10);
                year = Math.min(Math.max(year, minYear), maxYear);
                options = { day: day, month: month, year: year };
            }
        }

        applySelection(options);

        if (activeDatepicker) {
            activeDatepicker.hide();
        }
    }

    $datePickerEl.on('keydown', handleEnterKey);
    $monthPickerEl.on('keydown', handleEnterKey);
    $yearPickerEl.on('keydown', handleEnterKey);

    function stylePickerOnFocus() {
        const $datepicker = $('.datepicker');
        if ($datepicker.length) {
            // $datepicker.removeClass('top-0 left-0');
            $datepicker.find('.datepicker-picker').removeClass('p-4').addClass('px-4 pt-4 py-2');
        }
    }

    $monthPickerEl.on('focus', stylePickerOnFocus);
    $yearPickerEl.on('focus', stylePickerOnFocus);

    function initializePicker() {
        if (activeClickHandler) {
            document.removeEventListener('click', activeClickHandler, true);
            activeClickHandler = null;
        }
        if (activeDatepicker) {
            activeDatepicker.destroy();
            activeDatepicker = null;
        }

        const selectedPicker = $('input[name="picker"]:checked').val();
        const currentYear = new Date().getFullYear();
        const minDate = new Date(currentYear - 2, 0, 1);
        const maxDate = new Date(currentYear + 5, 11, 31);

        if (selectedPicker === 'month') {
            activeDatepicker = new Datepicker($monthPickerEl[0], {
                autohide: false,
                format: 'mm/yyyy',
                minDate: minDate,
                maxDate: maxDate,
                buttons: false,
                autoSelectToday: false,
            });

            const datepickerInstance = activeDatepicker.getDatepickerInstance();
            if (datepickerInstance && datepickerInstance.config) {
                datepickerInstance.config.maxView = 2;
                datepickerInstance.config.startView = 1;

                if (datepickerInstance.picker) {
                    $.each(datepickerInstance.picker.views, function (i, view) {
                        if (view.id === 0) {
                            view.disabled = true;
                        }
                    });
                    datepickerInstance.picker.changeView(1);
                    datepickerInstance.picker.render();
                }
            }

            const monthClickHandler = function (e) {
                const picker = datepickerInstance.picker;
                const $monthsGrid = $('.datepicker .months, .datepicker .datepicker-view.months');
                if (!$monthsGrid.length) return;

                const cell = e.target.closest('.datepicker-cell');
                if (!cell || !$monthsGrid.has(cell).length || cell.classList.contains('disabled')) return;

                e.stopImmediatePropagation();
                e.preventDefault();

                const monthIndex = Number(cell.getAttribute('data-month')) || Array.from(cell.parentElement.children).indexOf(cell);
                const year = new Date(picker.viewDate).getFullYear();

                applySelection({ month: monthIndex + 1, year: year });

                activeDatepicker.hide();
            };

            activeClickHandler = monthClickHandler;
            document.addEventListener('click', activeClickHandler, true);

        } else if (selectedPicker === 'year') {
            activeDatepicker = new Datepicker($yearPickerEl[0], {
                autohide: false,
                format: 'yyyy',
                minDate: minDate,
                maxDate: maxDate,
                buttons: false,
                autoSelectToday: false,
            });

            const datepickerInstance = activeDatepicker.getDatepickerInstance();
            if (datepickerInstance && datepickerInstance.config) {
                datepickerInstance.config.maxView = 2;
                datepickerInstance.config.startView = 2;

                if (datepickerInstance.picker) {
                    $.each(datepickerInstance.picker.views, function (i, view) {
                        if (view.id === 0 || view.id === 1) {
                            view.disabled = true;
                        }
                    });
                    datepickerInstance.picker.changeView(2);
                    datepickerInstance.picker.render();
                }
            }

            const yearClickHandler = function (e) {
                const $yearsGrid = $('.datepicker .years, .datepicker .datepicker-view.years');
                if (!$yearsGrid.length) return;

                const cell = e.target.closest('.datepicker-cell');
                if (!cell || !$yearsGrid.has(cell).length || cell.classList.contains('disabled')) return;

                e.stopImmediatePropagation();
                e.preventDefault();

                const year = Number(cell.getAttribute('data-year')) || parseInt(cell.textContent, 10);
                if (isNaN(year)) return;

                applySelection({ year: year });

                activeDatepicker.hide();
            };

            activeClickHandler = yearClickHandler;
            document.addEventListener('click', activeClickHandler, true);
        } else {
            activeDatepicker = new Datepicker($datePickerEl[0], {
                autohide: true,
                format: 'dd/mm/yyyy',
                minDate: minDate,
                maxDate: maxDate,
                buttons: false,
                autoSelectToday: 1,
            });

            const datepickerInstance = activeDatepicker.getDatepickerInstance();
            if (datepickerInstance && datepickerInstance.config) {
                datepickerInstance.config.maxView = 2;
                datepickerInstance.config.startView = 0;
            }

            const dateClickHandler = function (e) {
                const $daysGrid = $('.datepicker .days, .datepicker .datepicker-view .days');
                if (!$daysGrid.length) return;

                const cell = e.target.closest('.datepicker-cell');
                if (!cell || !$daysGrid.has(cell).length || cell.classList.contains('disabled')) return;

                e.stopImmediatePropagation();
                e.preventDefault();

                const date = new Date(Number(cell.getAttribute('data-date')));

                const day = date.getDate();
                const month = date.getMonth() + 1;
                const year = date.getFullYear();

                applySelection({ day: day, month: month, year: year });

                activeDatepicker.hide();
            };

            activeClickHandler = dateClickHandler;
            document.addEventListener('click', activeClickHandler, true);
        }
    }

    const $textDisplays = $('#selected_date, #selected_month, #selected_year, #selected_value');
    const $pickerFields = {
        date: $('#date-field'),
        month: $('#month-field'),
        year: $('#year-field')
    };
    const $s = {
        s1: $('#s1'),
        s2: $('#s2'),
        s3: $('#s3'),
        s4: $('#s4')
    };
    const $tip = $('#tip');
    const $allS = $('#s1, #s2, #s3, #s4');
    const $allPickerFields = $('#date-field, #month-field, #year-field');

    const pickerConfig = {
        date: {
            fieldsToShow: [$pickerFields.date],
            sToShow: [$allS],
            tipText: 'date'
        },
        month: {
            fieldsToShow: [$pickerFields.month],
            sToShow: [$s.s2, $s.s3, $s.s4],
            tipText: 'month and year -only'
        },
        year: {
            fieldsToShow: [$pickerFields.year],
            sToShow: [$s.s3, $s.s4],
            tipText: 'year -only',
            clearText: true
        }
    };

    function clearTextDisplays() {
        $textDisplays.text('None');
    }

    function togglePickerFields() {
        clearTextDisplays();

        const selectedPicker = $('.picker:checked').val() || 'date';
        const config = pickerConfig[selectedPicker];

        $allPickerFields.hide();
        $allS.hide();

        config.fieldsToShow.forEach($field => $field.show());
        config.sToShow.forEach($sElement => {
            if (config.clearText) {
                $sElement.show();
            } else {
                $sElement.show();
            }
        });

        $tip.text(config.tipText);

        initializePicker();
    }

    togglePickerFields();

    $('.picker').on('change', togglePickerFields);
});
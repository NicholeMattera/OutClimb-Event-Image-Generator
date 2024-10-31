import ImageGenerator from './image-generator';

export default class FormManager {
    static get EventItemHTML () {
        return document.getElementById('event-item').innerHTML;
    }

    constructor () {
        this.imageGeneratorLoaded = false;
        this.imageGenerator = new ImageGenerator(() => {
            this.imageGeneratorLoaded = true;

            // Initial Preview Draw
            this._generatePreview();
        });

        // DOM Elements
        this.addEventButton = document.querySelector('#add-button');
        this.eventList = document.querySelector('#event-list');
        this.generateButton = document.querySelector('#generate-button');

        // Create initial event item
        const eventItem = document.createElement('li');
        eventItem.innerHTML = FormManager.EventItemHTML;
        eventItem.removeChild(eventItem.querySelector('.field:last-child'));
        eventItem.querySelector('select').id = 'event-select-field-0-0';
        eventItem.querySelector('select').addEventListener('change', this._onLocationChange.bind(this));
        eventItem.querySelector('select').parentElement.querySelector('label').htmlFor = 'event-select-field-0-0';
        const inputs = eventItem.querySelectorAll('input');
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].id = 'event-input-field-' + i + '-0';
            inputs[i].addEventListener('input', this._generatePreview.bind(this));
            inputs[i].parentElement.querySelector('label').htmlFor = 'event-input-field-' + i + '-0';
        }
        this.eventList.appendChild(eventItem);

        // Automatically select the next month
        const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 1)).getMonth();
        console.log(nextMonth);
        document.getElementsByName('month')[0].querySelector(`option:nth-of-type(${nextMonth + 1})`).selected = true;

        // Event Listeners
        this.addEventButton.addEventListener('click', this._onAddEventButtonClicked.bind(this));
        this.generateButton.addEventListener('click', this._onGenerateButtonClicked.bind(this));
        document.getElementsByName('month')[0].addEventListener('change', this._generatePreview.bind(this));
        document.getElementsByName('top-details')[0].addEventListener('input', this._generatePreview.bind(this));
        document.getElementsByName('bottom-details')[0].addEventListener('input', this._generatePreview.bind(this));
    }

    _appendOrdinalSuperscript (number) {
        if (number === '') return '';
        if (number > 10 && number < 20) return number + 'th';

        const lastDigit = number.toString().slice(-1);
        if (lastDigit === '1') return number + 'st';
        if (lastDigit === '2') return number + 'nd';
        if (lastDigit === '3') return number + 'rd';

        return number + 'th';
    }

    _getData () {
        const events = [];
        const names = document.getElementsByName('name');
        const times = document.getElementsByName('time');
        const locations = document.getElementsByName('location');
        const customLocations = document.getElementsByName('custom-location');
        const details = document.getElementsByName('details');
        document.getElementsByName('day').forEach((day, index) => {
            events.push({
                day: this._appendOrdinalSuperscript(day.value.trim()).trim(),
                name: (names[index].value.trim()+ ' ' + times[index].value.trim()).trim(),
                details: details[index].value.trim(),
                detailsNum: 0,
                location: locations[index].value === 'custom' ? customLocations[index].value.trim() : locations[index].value.trim(),
            });
        });

        events.sort((a, b) => parseInt(a.day) - parseInt(b.day));

        let detailsMap = {};
        let detailsNum = 1;
        events.forEach((event) => {
            if (event.details.length === 0) return;

            if (detailsMap[event.details]) {
                event.detailsNum = detailsMap[event.details];
                event.details = '';
            } else {
                event.detailsNum = detailsNum;
                detailsMap[event.details] = detailsNum;
                detailsNum++;
            }
        });
        detailsMap = {};

        return {
            events,
            topDetails: document.getElementsByName('top-details')[0].value.trim(),
            bottomDetails: document.getElementsByName('bottom-details')[0].value.trim(),
            month: document.getElementsByName('month')[0].value.trim(),
        };
    }

    _generatePreview () {
        if (!this.imageGeneratorLoaded) return;

        this.imageGenerator.generatePreview(this._getData());
    }

    _onAddEventButtonClicked () {
        const eventItemNumber = this.eventList.children.length + 1;
        const eventItem = document.createElement('li');
        eventItem.innerHTML = FormManager.EventItemHTML;
        eventItem.querySelector('button').addEventListener('click', this._onRemoveEventButtonClicked.bind(this));
        eventItem.querySelector('select').id = 'event-select-field-0-' + eventItemNumber;
        eventItem.querySelector('select').addEventListener('change', this._onLocationChange.bind(this));
        eventItem.querySelector('select').parentElement.querySelector('label').htmlFor = 'event-select-field-0-' + eventItemNumber;
        const inputs = eventItem.querySelectorAll('input');
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].id = 'event-input-field-' + i + '-' + eventItemNumber;
            inputs[i].addEventListener('input', this._generatePreview.bind(this));
            inputs[i].parentElement.querySelector('label').htmlFor = 'event-input-field-' + i + '-' + eventItemNumber;
        }
        this.eventList.appendChild(eventItem);

        this._generatePreview();
    }

    _onLocationChange (event) {
        const selectElement = event.target;
        const liElement = selectElement.parentElement.parentElement;
        const fieldElement = liElement.querySelector('.field:nth-child(5)');
        const inputElement = fieldElement.querySelector('input');

        if (selectElement.value === 'custom') {
            inputElement.value = '';
            fieldElement.style.display = 'block';
        } else {
            fieldElement.style.display = 'none';
        }

        this._generatePreview();
    }

    _onGenerateButtonClicked () {
        const data = this._getData();
        const imageURL = this.imageGenerator.getDownloadURL();

        const anchor = document.createElement('a');
        anchor.download = `OutClimb-${data.month}-${Date.now()}.png`;
        anchor.href = imageURL;
        anchor.click();
    }

    _onRemoveEventButtonClicked (event) {
        const eventItem = event.target.parentElement.parentElement;
        eventItem.parentElement.removeChild(eventItem);

        this._generatePreview();
    }
}

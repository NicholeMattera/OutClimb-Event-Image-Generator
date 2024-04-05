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
        eventItem.querySelector('select').addEventListener('change', this._generatePreview.bind(this));
        const inputs = eventItem.querySelectorAll('input');
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].addEventListener('input', this._generatePreview.bind(this));
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

    _getData () {
        const events = [];
        const names = document.getElementsByName('name');
        const locations = document.getElementsByName('location');
        const details = document.getElementsByName('details');
        document.getElementsByName('day').forEach((day, index) => {
            events.push({
                day: day.value.trim(),
                name: names[index].value.trim(),
                details: details[index].value.trim(),
                detailsNum: 0,
                location: locations[index].value.trim(),
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
        const eventItem = document.createElement('li');
        eventItem.innerHTML = FormManager.EventItemHTML;
        eventItem.querySelector('button').addEventListener('click', this._onRemoveEventButtonClicked.bind(this));
        eventItem.querySelector('select').addEventListener('change', this._generatePreview.bind(this));
        const inputs = eventItem.querySelectorAll('input');
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].addEventListener('input', this._generatePreview.bind(this));
        }
        this.eventList.appendChild(eventItem);

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

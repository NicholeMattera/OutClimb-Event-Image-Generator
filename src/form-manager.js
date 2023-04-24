import ImageGenerator from './image-generator';

export default class FormManager {
    static get EventItemHTML () {
        return `
<div class="field">
    <label>Day</label>
    <input name="day" type="text" />
</div>

<div class="field">
    <label>Name</label>
    <input name="name" type="text" />
</div>

<div class="field">
    <label>Description</label>
    <input name="description" type="text" />
</div>

<div class="field">
    <button>Remove Event</button>
</div>`;
    }

    constructor () {
        this.imageGenerator = new ImageGenerator();

        // DOM Elements
        this.addEventButton = document.querySelector('#add-button');
        this.eventList = document.querySelector('#event-list');
        this.generateButton = document.querySelector('#generate-button');

        // Event Listeners
        this.addEventButton.addEventListener('click', this._onAddEventButtonClicked.bind(this));
        this.generateButton.addEventListener('click', this._onGenerateButtonClicked.bind(this));
    }

    _getData () {
        const events = [];
        const names = document.getElementsByName('name');
        const descriptions = document.getElementsByName('description');
        document.getElementsByName('day').forEach((day, index) => {
            events.push({
                day: day.value,
                name: names[index].value,
                description: descriptions[index].value
            });
        });

        return {
            events,
            info: document.getElementsByName('info')[0].value.trim(),
            month: document.getElementsByName('month')[0].value,
        };
    }

    _onAddEventButtonClicked () {
        const eventItem = document.createElement('li');
        eventItem.innerHTML = FormManager.EventItemHTML;
        eventItem.querySelector('button').addEventListener('click', this._onRemoveEventButtonClicked.bind(this));
        this.eventList.appendChild(eventItem);
    }

    _onGenerateButtonClicked () {
        const data = this._getData();
        const imageURL = this.imageGenerator.generate(data);

        const anchor = document.createElement('a');
        anchor.download = `Outclimb-${data.month}-${Date.now()}.png`;
        anchor.href = imageURL;
        anchor.click();
    }

    _onRemoveEventButtonClicked (event) {
        const eventItem = event.target.parentElement.parentElement;
        eventItem.parentElement.removeChild(eventItem);
    }
}

export default class ImageGenerator {
    constructor () {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.rainbowGradient = [
            { offset: 0, color: '#E60000' },
            { offset: 0.2, color: '#FF8E00' },
            { offset: 0.4, color: '#FFEF00' },
            { offset: 0.6, color: '#00821B' },
            { offset: 0.8, color: '#004BFF' },
            { offset: 1, color: '#770089' }
        ];

        // Load Fonts
        this.montserratBold = new FontFace('MonterratBold', 'url(/fonts/montserrat-bold.ttf)');
        this.montserratBold.load().then(this._fontLoaded);
        this.montserratMedium = new FontFace('MonterratMedium', 'url(/fonts/montserrat-medium.ttf)');
        this.montserratMedium.load().then(this._fontLoaded);

        // Load Images
        this.backgroundImage = new Image();
        this.backgroundImage.src = '/images/background.webp';
        this.logoImage = new Image();
        this.logoImage.src = '/images/logo.webp';
    }

    _drawBackground (dimens) {
        // Clear canvas
        this.context.fillRect(0, 0, dimens.width, dimens.height);

        // Draw Background Image
        this.context.drawImage(
            this.backgroundImage,
            0,
            0,
            this.backgroundImage.width,
            this.backgroundImage.height
        );

        // Draw Rainbow Overlay
        const gradient = this.context.createLinearGradient(0, 0, dimens.width, dimens.height);
        this.rainbowGradient.forEach(({ offset, color }) => gradient.addColorStop(offset, color));
        this.context.globalCompositeOperation = 'screen';
        this.context.fillStyle = gradient;
        this.context.fillRect(0, 0, dimens.width, dimens.height);
        this.context.globalCompositeOperation = 'source-over';

        // Draw Logo
        this.context.drawImage(
            this.logoImage,
            (dimens.width - this.logoImage.width) / 2,
            (dimens.details.headerHeight - this.logoImage.height) / 2, 
            this.logoImage.width,
            this.logoImage.height
        );

        // Return context properties back to default
        this.context.fillStyle = '#000000';
    }

    _drawEvents (data, dimens) {
        this.context.fillStyle = '#000000';
        this.context.font = '32px MonterratBold';

        // Draw Month
        const month = data.month.toUpperCase();
        const monthDimens = this.context.measureText(month);
        const monthCenterAlignX = (dimens.details.dayWidth - monthDimens.width) / 2;
        this.context.fillText(month, monthCenterAlignX, 200 - 8, dimens.details.dayWidth);

        // Draw Events
        data.events.forEach(({ day, name }, index) => {
            const { dayWidth, headerHeight, eventGap, eventHeight } = dimens.details

            const backgroundY = headerHeight + (eventHeight + eventGap) * index;
            const centerAlignY = headerHeight + ((128 + 16) * index) + 75;

            this.context.fillStyle = 'rgba(255, 255, 255, 0.8)';

            // Day Background
            this.context.beginPath();
            this.context.roundRect(-8, backgroundY, dayWidth + 8, eventHeight, 8);
            this.context.fill();

            // Name Background
            this.context.beginPath();
            this.context.roundRect(dayWidth + eventGap, backgroundY, 1088 - (dayWidth + eventGap), eventHeight, 8);
            this.context.fill();

            this.context.fillStyle = '#000000';

            // Day Text
            const dayDimens = this.context.measureText(day.toUpperCase());
            const dayCenterAlignX = (dayWidth - dayDimens.width) / 2;
            this.context.fillText(day.toUpperCase(), dayCenterAlignX, centerAlignY, dayWidth);

            // Name text
            const nameWidth = dimens.width - (dayWidth + 48);
            this.context.fillText(name.toUpperCase(), dayWidth + 32, centerAlignY, nameWidth);
        });

        // Return context properties back to default
        this.context.fillStyle = '#000000';
    }

    _drawInformation (data, dimens) {

        // Return context properties back to default
        this.context.fillStyle = '#000000';
        this.context.filter = 'none';
    }

    _fontLoaded (font) {
        document.fonts.add(font);
    }

    _getDimensions (data) {
        const dayWidth = 256;
        const eventGap = 16;
        const eventHeight = 128;
        const headerHeight = 200;
        const width = 1080;

        const details = {
            dayWidth,
            eventGap,
            eventHeight,
            footerHeight: 0,
            contentHeight: data.events.length * (eventHeight + eventGap),
            headerHeight
        };

        return {
            details,
            height: details.footerHeight + details.contentHeight + details.headerHeight,
            width
        }
    }

    _generateMultilineText (text) {

    }

    generate (data) {
        const dimens = this._getDimensions(data);
        this.canvas.width = dimens.width;
        this.canvas.height = dimens.height;

        this._drawBackground(dimens);
        this._drawEvents(data, dimens);
        this._drawInformation(data, dimens);

        return this.canvas.toDataURL('image/png');
    }
}

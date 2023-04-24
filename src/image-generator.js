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
        data.events.forEach(({ day, name, description }, index) => {
            this.context.font = '32px MonterratBold';

            const { dayWidth, headerHeight, eventGap, eventHeight } = dimens.details
            const hasDescription = description.trim().length > 0;

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
            const nameDescriptionWidth = dimens.width - (dayWidth + 48);
            this.context.fillText(name.toUpperCase(), dayWidth + 32, (hasDescription) ? centerAlignY - 16 : centerAlignY, nameDescriptionWidth);

            // Description Text
            if (hasDescription) {
                this.context.font = '24px MonterratMedium';
                this.context.fillText(description, dayWidth + 32, centerAlignY + 16, nameDescriptionWidth);
            }
        });

        // Return context properties back to default
        this.context.fillStyle = '#000000';
    }

    _drawInformation (lines, dimens) {
        const footerTop = dimens.details.headerHeight + dimens.details.contentHeight;

        if (lines.length === 0) {
            // TODO Draw MBP Logo in center
        } else {

            this.context.fillStyle = 'rgba(255, 255, 255, 0.8)';

            // Information Background
            this.context.beginPath();
            this.context.roundRect(
                dimens.details.eventGap,
                footerTop,
                dimens.width - dimens.details.eventGap * 2,
                dimens.details.informationHeight,
                8
            );
            this.context.fill();    

            // Draw Information
            this.context.fillStyle = '#000000';
            this.context.font = '24px MonterratMedium';
            lines.forEach((line, index) => {
                this.context.fillText(
                    line,
                    32,
                    footerTop + dimens.details.eventGap * 2 + 28 * index,
                    dimens.width - dimens.details.eventGap * 4
                );
            });
        }

        // Return context properties back to default
        this.context.fillStyle = '#000000';
        this.context.filter = 'none';
    }

    _fontLoaded (font) {
        document.fonts.add(font);
    }

    _getDimensions (data, informationLines) {
        const dayWidth = 256;
        const eventGap = 16;
        const eventHeight = 128;
        const headerHeight = 200;
        const informationHeight = (informationLines.length === 0) ? 0 : eventGap * 2 + 28 * informationLines.length
        const width = 1080;

        const details = {
            contentHeight: data.events.length * (eventHeight + eventGap),
            dayWidth,
            eventGap,
            eventHeight,
            footerHeight: (informationHeight === 0) ? headerHeight - eventGap : eventGap + informationHeight, 
            headerHeight,
            informationHeight
        };

        return {
            details,
            height: details.footerHeight + details.contentHeight + details.headerHeight,
            width
        }
    }

    _generateMultilineText (text) {
        if (text.trim().length === 0) return [];
        this.context.font = '24px MonterratMedium';

        const lines = [];
        text.split('\n').forEach((line) => {
            let workingLine = [];
            line.split(' ').forEach((word) => {
                const lineDimens = this.context.measureText(workingLine.join(' ') + ' ' + word);
                if (lineDimens.width > 1016) {
                    lines.push(workingLine.join(' '));
                    workingLine = [];
                }
                
                workingLine.push(word);
            });

            if (workingLine.length > 0) {
                lines.push(workingLine.join(' '));
            }
        });

        return lines;
    }

    generate (data) {
        const informationLines = this._generateMultilineText(data.info);

        const dimens = this._getDimensions(data, informationLines);
        this.canvas.width = dimens.width;
        this.canvas.height = dimens.height;

        this._drawBackground(dimens);
        this._drawEvents(data, dimens);
        this._drawInformation(informationLines, dimens);

        return this.canvas.toDataURL('image/png');
    }
}

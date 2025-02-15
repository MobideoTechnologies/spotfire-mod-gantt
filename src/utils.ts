import * as d3 from "d3";
import { Tooltip } from "spotfire/spotfire-api-1-2";

export const _MS_PER_DAY = 24 * 3600 * 1000;

export function getMinDate(a: Date, b: Date) {
    if (a && b) {
        return a > b ? b : a;
    }
    return a || b;
}

export function getMaxDate(a: Date, b: Date) {
    if (a && b) {
        return a < b ? b : a;
    }
    return a || b;
}

export function dateDiffInDays(a: Date, b: Date, includeLastDay = false) {
    if (!a || !b) {
        console.log("Warning: Null date in dateDiffInDays", { a, b });
        return 0;
    }

    // Create new dates without timezone conversion
    const d1 = new Date(a.getFullYear(), a.getMonth(), a.getDate());
    const d2 = new Date(b.getFullYear(), b.getMonth(), b.getDate());

    // Calculate difference in days
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.floor(diffTime / _MS_PER_DAY);

    return includeLastDay ? diffDays + 1 : diffDays;
}

export function addDays(date: Date, days: number) {
    // Create new date without timezone conversion
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    d.setDate(d.getDate() + days);
    return d;
}

export function getTranslation(transform: string) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttributeNS(null, "transform", transform);
    const { matrix } = g.transform.baseVal.consolidate();
    return [matrix.e, matrix.f];
}

export function getDates(begin: Date, end: Date) {
    const dates = [];
    // Create new dates without timezone conversion
    let s = new Date(begin.getFullYear(), begin.getMonth(), begin.getDate());
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    while (s.getTime() <= e.getTime()) {
        dates.push(s.getTime());
        s = addDays(s, 1);
    }
    return dates;
}

export function time2Pixel(startDate: Date, endDate: Date, unitWidth: number) {
    return ((endDate.getTime() - startDate.getTime()) * unitWidth) / _MS_PER_DAY;
}

export function textWidth(text: string, fontSize: number, fontFace: string, pad: number) {
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.font = fontSize + "px " + fontFace;
    const metrics = ctx.measureText(text);
    const textMeasures = {
        widht: metrics.width + pad,
        height: Math.abs(metrics.actualBoundingBoxAscent) + Math.abs(metrics.actualBoundingBoxDescent) + pad
    };
    return textMeasures;
}

export function insideBoundingBox(smallBox: DOMRect, bigBox: DOMRect): boolean {
    return smallBox.x > bigBox.x && (smallBox.x + smallBox.width) < (bigBox.x + bigBox.width);
}

export function adjustText(type: string, tooltip: Tooltip) {
    const unitTexts = d3.selectAll("#" + type + " text");

    unitTexts.each(function (_, i) {
        let textElement = d3.select(this as SVGPathElement);
        const initialText = textElement.text();
        let textPath = d3.select((this as SVGPathElement).previousSibling as SVGPathElement);
        let textBoundingBox = textElement.node().getBBox();
        const pathBoundingBox = textPath.node().getBBox();
        while (!insideBoundingBox(textBoundingBox, pathBoundingBox) && textElement.text() !== "") {
            const text = textElement.text();

            if (text.length > 4) {
                textElement.text(text.slice(0, -4) + "...");
            } else if (!text.includes("...")) {
                textElement.text(text.slice(0, -1));
            } else {
                textElement.text(text.slice(0, -3));
            }
            textBoundingBox = textElement.node().getBBox();
        }
        if (textElement.text() !== initialText) {
          textElement
              .on("mouseover", () => {
                  tooltip.show(initialText);
              })
              .on("mouseout", () => {
                  tooltip.hide();
              });
      }
    });
}

export function increaseBrightness(hex: string, percent: number){
    hex = hex.replace(/^\s*#|\s*$/g, '');

    if(hex.length == 3){
        hex = hex.replace(/(.)/g, '$1$1');
    }

    var r = parseInt(hex.substr(0, 2), 16),
        g = parseInt(hex.substr(2, 2), 16),
        b = parseInt(hex.substr(4, 2), 16);

    return '#' +
       ((0|(1<<8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
       ((0|(1<<8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
       ((0|(1<<8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
}
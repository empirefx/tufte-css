/**
 * Grid Line Visualizer
 *
 * A small JavaScript library to visualize CSS grid column lines for an article element.
 * Creates horizontal lines at specified grid areas: breakout-start, content-start, content-end, and breakout-end.
 */
(function() {
  class GridVisualizer {
    constructor(targetSelector = 'article', options = {}) {
      this.targetSelector = targetSelector;
      this.options = {
        lineColor: 'violet',
        lineWidth: '1px',
        showLabels: true,
        labelColor: '#fff',
        labelBackground: 'violet',
        labelPadding: '3px 6px',
        labelBorderRadius: '3px',
        zIndex: 9999,
        ...options
      };

      this.lineNames = [
        'breakout-start',
        'content-start',
        'content-end',
        'breakout-end'
      ];

      this.lines = [];
      this.labels = [];
      this.container = null;
    }

    init() {
      this.target = document.querySelector(this.targetSelector);
      if (!this.target) {
        console.error(`Target element "${this.targetSelector}" not found.`);
        return;
      }

      this.createContainer();
      this.createLines();

      // Update lines on window resize
      window.addEventListener('resize', this.updateLines.bind(this));

      // Update lines on scroll
      window.addEventListener('scroll', this.updateLinesPosition.bind(this));

      // Initial update
      this.updateLines();
    }

    createContainer() {
      // Create a container for our visualization elements
      this.container = document.createElement('div');
      this.container.className = 'grid-visualizer-container';
      this.container.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: ${this.options.zIndex};
      `;

      document.body.appendChild(this.container);
    }

    createLines() {
      this.lineNames.forEach(lineName => {
        // Create line element
        const line = document.createElement('div');
        line.className = `grid-visualizer-line ${lineName}`;
        line.style.cssText = `
          position: absolute;
          width: 1px;
          height: 100vh;
          background-color: ${this.options.lineColor};
          border-left: ${this.options.lineWidth} dashed ${this.options.lineColor};
          background: none;
          top: 0;
          z-index: ${this.options.zIndex};
        `;
        this.container.appendChild(line);
        this.lines.push({ element: line, name: lineName });

        // Create label if enabled
        if (this.options.showLabels) {
          const label = document.createElement('div');
          label.className = `grid-visualizer-label ${lineName}`;
          label.textContent = lineName;
          label.style.cssText = `
            position: absolute;
            background-color: ${this.options.labelBackground};
            color: ${this.options.labelColor};
            padding: ${this.options.labelPadding};
            border-radius: ${this.options.labelBorderRadius};
            font-family: monospace;
            font-size: 12px;
            font-weight: bold;
            white-space: nowrap;
            transform: translateX(-50%);
            top: 20px;
            z-index: ${this.options.zIndex + 1};
          `;
          this.container.appendChild(label);
          this.labels.push({ element: label, name: lineName });
        }
      });
    }

    updateLines() {
      // Get the target's bounding client rect
      const targetRect = this.target.getBoundingClientRect();

      // Get computed style to access the grid template columns
      const computedStyle = window.getComputedStyle(this.target);

      // This helper gets the physical position of a grid column line by name
      const getColumnPosition = (name) => {
        // Query the grid line position
        try {
          // Get the left position of the named grid line
          const leftPosition = this.target.offsetLeft +
            targetRect.width *
            this.getColumnPercentage(computedStyle.gridTemplateColumns, name);
          return leftPosition;
        } catch (e) {
          console.error(`Error finding position for ${name}:`, e);
          return 0;
        }
      };

      // Update each line's position
      this.lines.forEach(line => {
        const position = getColumnPosition(line.name);
        line.element.style.left = `${position}px`;
      });

      // Update each label's position
      if (this.options.showLabels) {
        this.labels.forEach(label => {
          const position = getColumnPosition(label.name);
          label.element.style.left = `${position}px`;
        });
      }
    }

    getColumnPercentage(gridTemplateColumns, lineName) {
      // Approximated positions
      const lineNameToIndex = {
        'breakout-start': .06 / 6,
        'content-start': .57 / 6,
        'content-end': 3.875 / 6,
        'breakout-end': 5.93 / 6
      };

      return lineNameToIndex[lineName] || 0;
    }

    updateLinesPosition() {
      // Update the lines' vertical position on scroll
      const scrollTop = window.scrollY;

      this.lines.forEach(line => {
        line.element.style.top = `${scrollTop}px`;
      });

      if (this.options.showLabels) {
        this.labels.forEach(label => {
          label.element.style.top = `${scrollTop + 20}px`;
        });
      }
    }

    toggle() {
      this.container.style.display =
        this.container.style.display === 'none' ? 'block' : 'none';
    }

    destroy() {
      // Remove event listeners
      window.removeEventListener('resize', this.updateLines);
      window.removeEventListener('scroll', this.updateLinesPosition);

      // Remove DOM elements
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
    }
  }

  // Export the library
  if (typeof window !== 'undefined') {
    window.GridVisualizer = GridVisualizer;
  }

  // Auto-initialize if data-auto-init attribute is present
  document.addEventListener('DOMContentLoaded', () => {
    const autoInitElements = document.querySelectorAll('[data-grid-visualizer="auto"]');
    autoInitElements.forEach(element => {
      const visualizer = new GridVisualizer(element.tagName.toLowerCase());
      visualizer.init();
    });
  });
})();

function toggleInspectorCSS() {
    const css = `
        body {
            width: 1400px;
            margin: auto;
            background-image: url("data:image/svg+xml,<svg id='patternId' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='120' height='20' patternTransform='scale(1) rotate(145)'><rect x='0' y='0' width='100%' height='100%' fill='%23fdf8ffff'/><path d='M-50.129 12.685C-33.346 12.358-16.786 4.918 0 5c16.787.082 43.213 10 60 10s43.213-9.918 60-10c16.786-.082 33.346 7.358 50.129 7.685'  stroke-width='0.5' stroke='%23e77affff' fill='none'/></pattern></defs><rect width='800%' height='800%' transform='translate(-240,-124)' fill='url(%23a)'/></svg>")
        }

        article {
            background: white;
        }

        article > * {
            background-color: lightblue;
            border: 1px solid #333;
        }
    `;

    const styleId = 'background-style';
    let styleElement = document.getElementById(styleId);

    if (styleElement) {
        // Remove the style if it exists
        styleElement.remove();
        return false;
    } else {
        // Add the style if it doesn't exist
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = css;
        document.head.appendChild(styleElement);
        return true;
    }
}

function showTip(text) {
    // Create new div element
    const tipDiv = document.createElement('div');

    // Set the text content
    tipDiv.textContent = text;
    // Apply styles
    tipDiv.style.position = 'absolute';
    tipDiv.style.top = '50px';
    tipDiv.style.left = '50%';
    tipDiv.style.color = '#C90000FF';
    tipDiv.style.fontSize = '18px';
    tipDiv.style.fontWeight = '900';
    tipDiv.style.borderRadius = '12px';
    tipDiv.style.transform = 'translateX(-50%)';
    tipDiv.style.backgroundColor = '#fff';
    tipDiv.style.backgroundImage = 'linear-gradient(0deg, #FFB0B0FF 0%, #FFFFFFFF 71%)';
    tipDiv.style.border = '1px #d45994ff solid';
    tipDiv.style.padding = '10px 20px';
    tipDiv.style.zIndex = '1000';

    // Add to document body
    document.body.appendChild(tipDiv);
}

showTip("Click to toggle Grid visualization. Body will have a fixed width.");
toggleInspectorCSS();

const visualizer = new GridVisualizer('article');
visualizer.init();

document.addEventListener('click', () => {
    visualizer.toggle();
    const isBackgroundOn = toggleInspectorCSS();
    console.log('Background is ' + (isBackgroundOn ? 'ON' : 'OFF'));
});

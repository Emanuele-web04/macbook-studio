// Small desktop icon studies drawn from simple paths, without external image assets.
export function drawDock(c: CanvasRenderingContext2D) {
  const colors = [
    '#299be9',
    '#eeeef3',
    '#168dea',
    '#40c859',
    '#168ef5',
    '#eee9d9',
    '#f6f6f6',
    '#3bbd4d',
    '#fafafa',
    '#b79865',
    '#fbfbf9',
    '#fff7d0',
    '#fafafa',
    '#121316',
    '#f13964',
    '#fafafa',
    '#248de9',
    '#a7a8ac',
    '#39a7eb',
    '#d9dde0',
  ];
  const x0 = 316,
    y0 = 1560,
    pitch = 97,
    size = 78;
  c.fillStyle = '#b6b6bf66';
  c.beginPath();
  c.roundRect(x0 - 20, y0 - 17, pitch * 19 + size + 40, 112, 25);
  c.fill();
  const stroke = (width = 3, color = '#fff') => {
    c.lineWidth = width;
    c.strokeStyle = color;
    c.lineCap = 'round';
    c.lineJoin = 'round';
  };
  function line(points: number[][]) {
    c.beginPath();
    points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.stroke();
  }
  function circle(x: number, y: number, r: number, color: string) {
    c.fillStyle = color;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fill();
  }
  for (let i = 0; i < colors.length; i++) {
    c.save();
    c.translate(x0 + i * pitch, y0);
    const gradient = c.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, colors[i]);
    gradient.addColorStop(1, colors[i] + 'da');
    c.fillStyle = gradient;
    c.beginPath();
    c.roundRect(0, 0, size, size, 16);
    c.fill();
    stroke();
    switch (i) {
      case 0:
        c.fillStyle = '#bee3fa';
        c.beginPath();
        c.moveTo(42, 0);
        c.lineTo(78, 0);
        c.lineTo(78, 78);
        c.lineTo(37, 78);
        c.lineTo(37, 47);
        c.lineTo(28, 47);
        c.closePath();
        c.fill();
        stroke(2.3, '#173e57');
        line([
          [19, 24],
          [19, 31],
        ]);
        line([
          [58, 24],
          [58, 31],
        ]);
        c.beginPath();
        c.moveTo(19, 51);
        c.quadraticCurveTo(40, 66, 60, 50);
        c.stroke();
        break;
      case 1:
        for (let y = 0; y < 3; y++)
          for (let x = 0; x < 3; x++) {
            c.fillStyle = [
              '#f25c60',
              '#ffa443',
              '#71c75b',
              '#39a9eb',
              '#8565da',
              '#e267bc',
            ][(x + y * 3) % 6];
            c.beginPath();
            c.roundRect(13 + x * 19, 13 + y * 19, 14, 14, 4);
            c.fill();
          }
        break;
      case 2:
        circle(39, 39, 32, '#f2f8fe');
        circle(39, 39, 28, '#38a8e8');
        stroke(1, '#ebf8ff');
        for (let a = 0; a < 24; a++) {
          const t = (a * Math.PI) / 12;
          line([
            [39 + 24 * Math.sin(t), 39 + 24 * Math.cos(t)],
            [39 + 27 * Math.sin(t), 39 + 27 * Math.cos(t)],
          ]);
        }
        c.fillStyle = '#e95560';
        c.beginPath();
        c.moveTo(56, 17);
        c.lineTo(35, 35);
        c.lineTo(43, 43);
        c.closePath();
        c.fill();
        c.fillStyle = '#fff';
        c.beginPath();
        c.moveTo(22, 61);
        c.lineTo(35, 35);
        c.lineTo(43, 43);
        c.closePath();
        c.fill();
        break;
      case 3:
        c.fillStyle = '#fff';
        c.beginPath();
        c.ellipse(39, 36, 27, 23, 0, 0, Math.PI * 2);
        c.fill();
        c.beginPath();
        c.moveTo(22, 48);
        c.lineTo(18, 65);
        c.lineTo(35, 54);
        c.fill();
        break;
      case 4:
        c.fillStyle = '#fff';
        c.beginPath();
        c.roundRect(11, 20, 56, 40, 5);
        c.fill();
        stroke(2, '#299ae7');
        line([
          [12, 22],
          [39, 43],
          [66, 22],
        ]);
        line([
          [12, 58],
          [30, 41],
        ]);
        line([
          [66, 58],
          [48, 41],
        ]);
        break;
      case 5:
        c.fillStyle = '#75c48c';
        c.fillRect(0, 44, 78, 34);
        stroke(12, '#fff');
        line([
          [0, 63],
          [78, 15],
        ]);
        stroke(8, '#ffc762');
        line([
          [13, 0],
          [60, 78],
        ]);
        circle(48, 30, 13, '#2c8feb');
        stroke(2);
        line([
          [43, 31],
          [48, 24],
          [52, 31],
        ]);
        break;
      case 6:
        for (let k = 0; k < 8; k++) {
          c.save();
          c.translate(39, 39);
          c.rotate((k * Math.PI) / 4);
          c.fillStyle = [
            '#f16660',
            '#fa9844',
            '#f9c750',
            '#8dc958',
            '#54bfa1',
            '#64a5dc',
            '#9b84cb',
            '#d978af',
          ][k];
          c.beginPath();
          c.ellipse(0, -15, 10, 17, 0, 0, Math.PI * 2);
          c.fill();
          c.restore();
        }
        circle(39, 39, 8, '#ffd986');
        break;
      case 7:
        c.fillStyle = '#fff';
        c.beginPath();
        c.roundRect(12, 24, 35, 30, 6);
        c.fill();
        c.beginPath();
        c.moveTo(50, 32);
        c.lineTo(67, 23);
        c.lineTo(67, 56);
        c.lineTo(50, 47);
        c.fill();
        break;
      case 8:
        c.fillStyle = '#ee5a5e';
        c.fillRect(0, 0, 78, 19);
        c.textAlign = 'center';
        c.font = '11px Arial';
        c.fillStyle = '#fff';
        c.fillText('SEP', 39, 14);
        c.font = '42px Arial';
        c.fillStyle = '#222';
        c.fillText('9', 39, 61);
        break;
      case 9:
        circle(38, 28, 12, '#8d734b');
        c.fillStyle = '#8d734b';
        c.beginPath();
        c.roundRect(19, 43, 39, 25, 14);
        c.fill();
        stroke(2, '#d8c69e');
        line([
          [66, 15],
          [66, 65],
        ]);
        break;
      case 10:
        for (let j = 0; j < 3; j++) {
          circle(17, 20 + j * 19, 4, ['#ec7a51', '#62a9dd', '#e9c957'][j]);
          stroke(2, '#bbb');
          line([
            [28, 20 + j * 19],
            [65, 20 + j * 19],
          ]);
        }
        break;
      case 11:
        c.fillStyle = '#ffda49';
        c.fillRect(0, 0, 78, 21);
        stroke(1.5, '#c8c3ab');
        for (let j = 0; j < 4; j++)
          line([
            [11, 34 + j * 10],
            [67, 34 + j * 10],
          ]);
        break;
      case 12:
        stroke(5, '#59a6c6');
        c.beginPath();
        c.moveTo(15, 58);
        c.bezierCurveTo(35, -4, 20, 75, 48, 32);
        c.bezierCurveTo(63, 10, 49, 59, 64, 43);
        c.stroke();
        break;
      case 13:
        c.font = 'bold 31px Arial';
        c.textAlign = 'center';
        c.fillStyle = '#fff';
        c.fillText('tv', 40, 50);
        break;
      case 14:
        stroke(5);
        line([
          [32, 53],
          [32, 24],
          [55, 19],
          [55, 48],
        ]);
        line([
          [32, 31],
          [55, 26],
        ]);
        circle(24, 57, 8, '#fff');
        circle(47, 52, 8, '#fff');
        break;
      case 15:
        stroke(10, '#eb5267');
        line([
          [22, 58],
          [22, 22],
          [55, 57],
          [55, 20],
        ]);
        break;
      case 16:
        stroke(6);
        line([
          [23, 56],
          [43, 21],
        ]);
        line([
          [37, 21],
          [58, 57],
        ]);
        line([
          [17, 46],
          [61, 46],
        ]);
        break;
      case 17:
        circle(39, 39, 30, '#6d6e72');
        stroke(4, '#d1d2d6');
        for (let k = 0; k < 12; k++) {
          const a = (k * Math.PI) / 6;
          line([
            [39 + 23 * Math.sin(a), 39 + 23 * Math.cos(a)],
            [39 + 29 * Math.sin(a), 39 + 29 * Math.cos(a)],
          ]);
        }
        circle(39, 39, 18, '#c7c8ca');
        circle(39, 39, 12, '#5e6164');
        break;
      case 18:
        c.fillStyle = '#8cdaff';
        c.beginPath();
        c.roundRect(8, 22, 62, 41, 5);
        c.fill();
        c.fillStyle = '#8cdaff';
        c.fillRect(10, 15, 26, 13);
        circle(40, 43, 12, '#3aa2d1');
        stroke(2);
        line([
          [40, 34],
          [40, 50],
          [34, 44],
        ]);
        line([
          [40, 50],
          [46, 44],
        ]);
        break;
      case 19:
        c.fillStyle = '#eceef0';
        c.beginPath();
        c.moveTo(20, 18);
        c.lineTo(59, 18);
        c.lineTo(55, 64);
        c.quadraticCurveTo(39, 71, 24, 64);
        c.closePath();
        c.fill();
        stroke(2, '#b1b6bd');
        for (let x = 29; x < 55; x += 8)
          line([
            [x, 26],
            [x, 60],
          ]);
        c.fillStyle = '#fafbfc';
        c.beginPath();
        c.ellipse(39, 18, 22, 6, 0, 0, Math.PI * 2);
        c.fill();
        break;
    }
    c.restore();
  }
}

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProfilePicture {

  constructor(){}

  generate(firstName: any, lastName: any): string{
    const initials = firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase();
    // tslint:disable-next-line: no-bitwise

    let randomColor = '#000000';
    const colorArry = ['#b388ff', '#64b5f6', '#ff9800', '#90caf9', '#f06292', '#ea80fc', '#82b1ff', '#43a047', '#82b1ff', '#558b2f', '#7986cb', '#CDDC39', '#3f51b5', '#F9CE1D', '#FF9800', '#FF5722', '#9E9E9E', '#7e57c2', '#795548', '#000000'];

    const charAscii = firstName.charCodeAt(0);
    randomColor = colorArry[charAscii % 19];

    // Create a rectangular canvas which will become th image.
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = canvas.height = 64;
    if (context){
      // Draw the circle in the background using the randomColor.
      context.fillStyle = randomColor;
      context.beginPath();
      context.ellipse(
        canvas.width / 2, canvas.height / 2, // Center x and y.
        canvas.width / 2, canvas.height / 2, // Horizontal and vertical "radius".
        0, // Rotation, useless for perfect circle.
        0, Math.PI * 2 // from and to angle: Full circle in radians.
      );
      context.fill();

      context.font = ((canvas.height * 2) / 5) + 'px sans-serif';
      context.fillStyle = '#ffffff';
      // Make the text's center overlap the image's center.
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(initials, canvas.width / 2, canvas.height / 2);
    }

    return canvas.toDataURL();
  }
}

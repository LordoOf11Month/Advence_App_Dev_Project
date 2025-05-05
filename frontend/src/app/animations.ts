import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
  state,
  group,
  animateChild,
  sequence
} from '@angular/animations';

export const fadeInOut = trigger('fadeInOut', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ opacity: 1 })),
  ]),
  transition(':leave', [
    animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ opacity: 0 })),
  ]),
]);

export const listAnimation = trigger('listAnimation', [
  transition('* => *', [
    query(':enter', [
      style({ 
        opacity: 0, 
        transform: 'translateY(20px)',
        filter: 'blur(4px)'
      }),
      stagger(50, [
        animate('400ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ 
          opacity: 1, 
          transform: 'translateY(0)',
          filter: 'blur(0)'
        })),
      ]),
    ], { optional: true }),
    query(':leave', [
      stagger(50, [
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ 
          opacity: 0, 
          transform: 'translateY(-20px)',
          filter: 'blur(4px)'
        })),
      ]),
    ], { optional: true }),
  ]),
]);

export const slideUpDown = trigger('slideUpDown', [
  transition(':enter', [
    style({ 
      transform: 'translateY(20px)', 
      opacity: 0,
      filter: 'blur(4px)'
    }),
    animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ 
      transform: 'translateY(0)', 
      opacity: 1,
      filter: 'blur(0)'
    })),
  ]),
  transition(':leave', [
    animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ 
      transform: 'translateY(20px)', 
      opacity: 0,
      filter: 'blur(4px)'
    })),
  ]),
]);

export const modalAnimation = trigger('modalAnimation', [
  transition(':enter', [
    group([
      query('.modal-backdrop', [
        style({ opacity: 0 }),
        animate('150ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ opacity: 1 })),
      ]),
      query('.modal-content', [
        style({ 
          opacity: 0, 
          transform: 'scale(0.95) translateY(20px)'
        }),
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ 
          opacity: 1, 
          transform: 'scale(1) translateY(0)'
        })),
      ]),
    ]),
  ]),
  transition(':leave', [
    group([
      query('.modal-backdrop', [
        animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ opacity: 0 })),
      ]),
      query('.modal-content', [
        animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ 
          opacity: 0, 
          transform: 'scale(0.95) translateY(20px)'
        })),
      ]),
    ]),
  ]),
]);

export const sectionAnimation = trigger('sectionAnimation', [
  transition(':enter', [
    query('.section-header', [
      style({ 
        opacity: 0, 
        transform: 'translateY(-20px)'
      }),
      animate('400ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ 
        opacity: 1, 
        transform: 'translateY(0)'
      })),
    ], { optional: true }),
    query('.data-table', [
      style({ 
        opacity: 0, 
        transform: 'translateY(20px)'
      }),
      animate('400ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ 
        opacity: 1, 
        transform: 'translateY(0)'
      })),
    ], { optional: true }),
  ]),
]);

export const tableRowAnimation = trigger('tableRowAnimation', [
  transition(':enter', [
    style({ 
      opacity: 0, 
      transform: 'translateX(-20px)',
      filter: 'blur(4px)'
    }),
    animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ 
      opacity: 1, 
      transform: 'translateX(0)',
      filter: 'blur(0)'
    })),
  ]),
  transition(':leave', [
    animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ 
      opacity: 0, 
      transform: 'translateX(20px)',
      filter: 'blur(4px)'
    })),
  ]),
]);
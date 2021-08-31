import { trigger, state, style, animate, transition, group, query, stagger, keyframes } from '@angular/animations'

export const SlideUpDown = [
  trigger('slideUpDown', [
    state('true', style({ transform: 'translateY(0)', opacity: 1 })),
    state('false', style({ transform: 'translateY(-20%)' })),
    transition('void => true', [
      style({ height: '0px', opacity: 0, marginTop:'0px', marginRight:'0px', marginBottom:'0px', marginLeft:'0px' }),
      animate('300ms ease-in-out')
    ]),
    transition('true => void', [
      animate('300ms ease-in-out', style({ opacity: 0, height: '0px', marginTop:'0px', marginRight:'0px', marginBottom:'0px', marginLeft:'0px' }))
    ])
    //transition('true => void', [group([
    //  animate('300ms ease-in-out', style({
    //    'opacity': '0'
    //  })),
    //  animate('300ms ease-in-out', style({
    //    'max-height': '0px'
    //  })),
    //  animate('300ms ease-in-out', style({
    //    'visibility': 'hidden'
    //  }))
    //])
    //])
  ])
]

export const CardLoad = [
  trigger('cardSlide', [
    state('cardInFast', style({ transform: 'translateY(0)' })),
    transition('void => cardInFast', [
      style({ transform: 'translateY(-50%)' }),
      animate('250ms ease-in-out')
    ]),
    state('cardIn', style({ transform: 'translateY(0)' })),
    transition('void => cardIn', [
      style({ transform: 'translateY(-50%)' }),
      animate('600ms ease-in-out')
    ]),
    state('cardEnter', style({ transform: 'translateX(0)' })),
    transition('void => cardEnter', [
      style({ transform: 'translateX(-100%)' }),
      animate('300ms ease-in-out')
    ]),
    state('cardLeave', style({ transform: 'translateX(0)' })),
    transition('void => cardLeave', [
      style({ transform: 'translateX(100%)' }),
      animate('300ms ease-in-out')
    ]),
  ]),
  trigger('stemaxSearch', [
    // ...
    state('expand', style({
      fontSize: '17px',
      display: 'flux'
    })),
    state('shrink', style({
      fontSize: '0px',
      display: 'none'
    })),
    transition('* => expand', [
      animate('150ms')
    ]),
    transition('* => shrink', [
      animate('150ms')
    ]),

    state('expandm', style({
      fontSize: '17px',
      width:'100%',
      display: 'flux'
    })),
    transition('* => expandm', [
      animate('250ms', keyframes([
        style({ width: '80%', offset: 0 }),
        style({ width: '100%', fontSize: '17px', display: 'none', offset: 1 })
      ]))
    ]),
    state('shrinkm', style({
      fontSize: '0px',
      width: '0%',
      display: 'none'
    })),
    transition('* => shrinkm', [
      animate('150ms', keyframes([
        style({ width: '0%', offset: 0 }),
        style({ fontSize: '0px', display: 'none', offset: 1 })
      ]))
    ]),

    state('shrinkmc', style({
    })),
    transition('* => shrinkmc', [
      animate('1ms')
    ]),
    state('expandmc', style({
      marginLeft:'15px'
    })),
    transition('* => expandmc', [
      animate('150ms', keyframes([
        style({ marginLeft: '80%', offset: 0 }),
        style({ marginLeft: '15px', offset: 1 })
      ]))
    ]),
  ]),
  trigger('openCloseChevronLeft', [
    state('open', style({
      width: '40px',
      marginLeft: '-13px',
      opacity: 0.7
    })),
    state('closed', style({
      width: '0px',
      marginLeft: '-30px',
      opacity: 0.2
    })),
    transition('open => closed', [
      animate('200ms ease-in-out')
    ]),
    transition('closed => open', [
      animate('200ms ease-in-out')
    ]),
  ]),
  trigger('openCloseChevronRight', [
    state('open', style({
      width: '60px',
      opacity: 0.7
    })),
    state('closed', style({
      width: '0px',
      opacity: 0.2
    })),
    transition('open => closed', [
      animate('200ms ease-in-out')
    ]),
    transition('closed => open', [
      animate('200ms ease-in-out')
    ]),
  ]),
]

export const FilterAnimation =[
  trigger('filterAnimation', [
    transition(':enter, * => 0, * => -1', []),
    transition(':increment', [
      query(':enter', [
        style({ opacity: 0, width: '0px' }),
        stagger(50, [
          animate('300ms ease-out', style({ opacity: 1, width: '*' })),
        ]),
      ], { optional: true })
    ]),
    transition(':decrement', [
      query(':leave', [
        stagger(10, [
          animate('300ms ease-out', style({ opacity: 0, width: '0px' })),
        ]),
      ])
    ]),
  ]),
]


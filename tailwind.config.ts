/** @type {import('tailwindcss').Config} */
import { withUt } from 'uploadthing/tw';
import { fontFamily } from 'tailwindcss/defaultTheme';


export default withUt({
  darkMode: ['class', '[data-mode="dark"]'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],	
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
		fontFamily: {
			sans: ['var(--font-ibm-plex-sans)', ...fontFamily.sans],
			'ibm-plex-sans': ['var(--font-ibm-plex-sans)', ...fontFamily.sans],
			title: ['var(--font-space-grotesk)', ...fontFamily.sans],
			'space-grotesk': ['var(--font-space-grotesk)', ...fontFamily.sans],
		},
  		colors: {
			// C4C brand palette (2026 refresh)
			c4c: {
				yellow: '#f7dc88',
				coral: '#ff6b58',
				burgundy: '#6c0e30',
				cobalt: '#2b48d8',
				petrol: '#00415a',
				sage: '#b9cdc5',
				paleblue: '#79d4dd',
				pink: '#ffb6b8',
				mist: '#f5f6fa',
				'mist-2': '#eeeff3',
				'mist-3': '#e8e9ec',
				ink: '#1a1814',
				border: '#d6d7da',
			},
  			primary: {
  				'50': ' #F6F8FD',
  				'500': '#624CF5',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
			// C4C brand colour system (2026 refresh)
			ink: {
				// renamed from `stratosphere` — value unchanged
				DEFAULT: '#1a1814',
				50: '#e8e9ec',
				100: '#d4d5d8',
				200: '#afafb0',
				300: '#888787',
				400: '#575654',
				500: '#1a1814',
				600: '#161411',
				700: '#12100e',
				800: '#0e0c0a',
				900: '#0a0908',
			},
			neutral: {
				// renamed from `sky` — warm-gray secondary text, borders, light surfaces
				DEFAULT: '#929292',
				50: '#eff0f4',
				100: '#e6e7ea',
				200: '#d5d6d9',
				300: '#c4c4c6',
				400: '#aeaeaf',
				500: '#929292',
				600: '#80807f',
				700: '#6c6b6a',
				800: '#585756',
				900: '#484644',
				tint: '#f5f6fa',  // mist — section backgrounds
			},
			gold: {
				// renamed from `ochre` — C4C brand yellow #f7dc88
				DEFAULT: '#f7dc88',
				50: '#fffdf8',
				100: '#fefaed',
				200: '#fcf4d9',
				300: '#fbeec4',
				400: '#f9e6a9',
				500: '#f7dc88',
				600: '#d2bb74',
				700: '#a8965c',
				800: '#807247',
				900: '#5e5434',
			},
			stone: {
				// renamed from `concrete` — structural neutral, dividers/borders
				DEFAULT: '#d6d7da',
				50: '#f3f4f8',
				100: '#eff0f4',
				200: '#e9e9ed',
				300: '#e2e2e6',
				400: '#d9d9dc',
				500: '#ceced1',
				600: '#b3b3b5',
				700: '#949495',
				800: '#787776',
				900: '#5e5d5c',
			},
			petrol: {
				// renamed from `forest` — C4C deep teal/navy #00415a
				DEFAULT: '#00415a',
				50: '#f0f4f5',
				100: '#d9e2e6',
				200: '#adc2ca',
				300: '#80a0ac',
				400: '#477688',
				500: '#00415a',
				600: '#00374c',
				700: '#002c3d',
				800: '#00222f',
				900: '#001922',
			},
			sage: {
				// renamed from `grass` — C4C sage green #b9cdc5
				DEFAULT: '#b9cdc5',
				50: '#fbfcfc',
				100: '#f4f8f6',
				200: '#e9efec',
				300: '#dce6e2',
				400: '#cddbd5',
				500: '#b9cdc5',
				600: '#9daea7',
				700: '#7e8b86',
				800: '#606b66',
				900: '#464e4b',
			},
			burgundy: {
				// renamed from `clay` — C4C deep burgundy #6c0e30
				DEFAULT: '#6c0e30',
				50: '#f6f1f3',
				100: '#e9dbe0',
				200: '#d0b2bd',
				300: '#b68698',
				400: '#95516a',
				500: '#6c0e30',
				600: '#5c0c29',
				700: '#490a21',
				800: '#380719',
				900: '#290512',
			},
			cobalt: {
				// C4C primary blue accent #2b48d8
				DEFAULT: '#2b48d8',
				50: '#f2f4fd',
				100: '#dfe4f9',
				200: '#bbc4f3',
				300: '#95a4ec',
				400: '#667be3',
				500: '#2b48d8',
				600: '#253db8',
				700: '#1d3193',
				800: '#162570',
				900: '#101b52',
			},
			paleblue: {
				// C4C light accent, pairs with cobalt — #79d4dd
				DEFAULT: '#79d4dd',
				50: '#f7fcfd',
				100: '#ebf9fa',
				200: '#d4f1f4',
				300: '#bceaee',
				400: '#9fe0e7',
				500: '#79d4dd',
				600: '#67b4bc',
				700: '#529096',
				800: '#3f6e73',
				900: '#2e5154',
			},
			blossom: {
				// C4C light accent, pairs with coral — #ffb6b8
				DEFAULT: '#ffb6b8',
				50: '#fffbfb',
				100: '#fff4f4',
				200: '#ffe8e8',
				300: '#ffdadc',
				400: '#ffcacc',
				500: '#ffb6b8',
				600: '#d99b9c',
				700: '#ad7c7d',
				800: '#855f60',
				900: '#614546',
			},
			mist: {
				// light neutral background, replaces old `cream`
				DEFAULT: '#f5f6fa',
				50: '#fefeff',
				100: '#fefefe',
				200: '#fcfcfd',
				300: '#fafafc',
				400: '#f8f9fb',
				500: '#f5f6fa',
				600: '#d0d1d4',
				700: '#a7a7aa',
				800: '#7f8082',
				900: '#5d5d5f',
			},
  			coral: {
				// C4C bright coral #ff6b58 — was a broken single-shade token
				// (`coral-500: #15BF59`, a stray green with no other shades defined,
				// leaving `coral-50/100/600/700` usages across the survey builder and
				// admin bug pages unstyled). Also absorbs the old `sand` family.
				DEFAULT: '#ff6b58',
				50: '#fff6f5',
				100: '#ffe9e6',
				200: '#ffd0ca',
				300: '#ffb5ac',
				400: '#ff9487',
				500: '#ff6b58',
				600: '#d95b4b',
				700: '#ad493c',
				800: '#85382e',
				900: '#612921',
  			},
  			grey: {
  				'50': '#F6F6F6',
  				'400': '#AFAFAF',
  				'500': '#757575',
  				'600': '#545454'
  			},
  			black: '#000000',
  			white: '#FFFFFF',
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require('tailwindcss-animate')],
});
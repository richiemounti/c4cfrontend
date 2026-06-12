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
			sans: ['var(--font-nunito)', ...fontFamily.sans],
			nunito: ['var(--font-nunito)', ...fontFamily.sans],
			title: ['var(--font-rajdhani)', ...fontFamily.sans],
			rajdhani: ['var(--font-rajdhani)', ...fontFamily.sans],
			// legacy
			sora: ['var(--font-nunito)', ...fontFamily.sans],
		},
  		colors: {
			// C4C brand palette
			c4c: {
				yellow: '#f2c539',
				teal: '#0fa7c9',
				red: '#e81043',
				orange: '#f48a5b',
				cream: '#faf9f6',
				'cream-2': '#f4f2ed',
				'cream-3': '#edeae3',
				ink: '#1a1814',
				border: '#e2ddd5',
			},
  			primary: {
  				'50': ' #F6F8FD',
  				'500': '#624CF5',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
			// C4C brand colour system
			stratosphere: {
				// remapped → C4C ink
				DEFAULT: '#1a1814',
				50: '#faf9f6',
				100: '#f4f2ed',
				200: '#e8e5dd',
				500: '#1a1814',
				600: '#141210',
				700: '#0e0d0b',
				900: '#080706',
			},
			sky: {
				// warm neutral — secondary text, borders, light surfaces
				// (use c4c-teal for the actual brand teal)
				DEFAULT: '#737068',
				50: '#faf9f6',
				100: '#f0ede8',
				200: '#d4cec9',
				300: '#b0a9a2',
				400: '#8a837c',
				500: '#737068',
				600: '#4d4a46',
				700: '#353230',
				900: '#1a1814',
				tint: '#faf9f6',  // cream — section backgrounds
			},
			ochre: {
				// remapped → C4C yellow
				DEFAULT: '#f2c539',
				50: '#fdfbf0',
				100: '#faf5d0',
				200: '#f7ec94',
				500: '#f2c539',
				600: '#d4a91e',
				700: '#b8891a',
				900: '#8a6010',
			},
			concrete: {
				DEFAULT: '#e2ddd5',
				50: '#faf9f6',
				100: '#f4f2ed',
				500: '#e2ddd5',
				900: '#a09890',
			},
			forest: {
				DEFAULT: '#2c4646',
				50: '#f6f8f8',
				100: '#ecf0f0',
				500: '#2c4646',
				900: '#1c2d2d'
			},
			grass: {
				DEFAULT: '#65865a',
				50: '#f6f8f6',
				100: '#ebf0e9',
				500: '#65865a',
				900: '#3f5236'
			},
			sand: {
				// remapped → C4C orange
				DEFAULT: '#f48a5b',
				50: '#fef6f1',
				100: '#fde9d9',
				500: '#f48a5b',
				900: '#8a3d1a',
			},
			clay: {
				// remapped → C4C red
				DEFAULT: '#e81043',
				50: '#fef0f4',
				100: '#fcd0db',
				500: '#e81043',
				900: '#8a0928',
			},
  			coral: {
  				'500': '#15BF59'
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
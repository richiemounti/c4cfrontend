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
			sans: ['var(--font-sora)', ...fontFamily.sans],
			sora: ['var(--font-sora)', ...fontFamily.sans],
		},
  		colors: {
  			primary: {
  				'50': ' #F6F8FD',
  				'500': '#624CF5',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
			// Add your new color scheme
			stratosphere: {
				DEFAULT: '#272236',
				50: '#f7f6f8',
				100: '#efeef1',
				500: '#272236',
				900: '#1a1729'
			},
			sky: {
				DEFAULT: '#89a0ae',
				50: '#f5f7f8',
				100: '#e8ecee',
				500: '#89a0ae',
				tint: '#e8ecee'
			},
			ochre: {
				DEFAULT: '#cd8028',
				50: '#fdf8f1',
				100: '#faebd6',
				500: '#cd8028',
				900: '#8a4d15'
			},
			concrete: {
				DEFAULT: '#e4e0e1',
				50: '#faf9fa',
				100: '#f5f4f4',
				500: '#e4e0e1',
				900: '#a8a1a3'
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
				DEFAULT: '#ce6e1c',
				50: '#fdf7f1',
				100: '#faead6',
				500: '#ce6e1c',
				900: '#8a4612'
			},
			clay: {
				DEFAULT: '#7f6a33',
				50: '#f9f7f4',
				100: '#f1ece3',
				500: '#7f6a33',
				900: '#544520'
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
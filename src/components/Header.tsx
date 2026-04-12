
import { cn } from '../lib/utils'
import { Link, useLocation } from 'react-router-dom'

interface Props {
    title: string,
    description: string,
    ctaUrl?: string,
    ctaText?: string,
}

const Header = ({ title, description, ctaText, ctaUrl }: Props) => {
    const location = useLocation()
    const isHome = location.pathname === "/"

    return (
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-light-200/40">
            <article className="space-y-1.5">
                <h1 className={cn(
                    "text-dark-100 tracking-tighter transition-all duration-500", 
                    isHome ? "text-[2rem] md:text-5xl font-bold mb-4" : "text-xl md:text-3xl font-bold"
                )}>
                    {title}
                </h1>

                <p className={cn(
                    "text-gray-500 font-normal leading-relaxed max-w-[500px]", 
                    isHome ? "text-base md:text-lg" : "text-sm md:text-base"
                )}>
                    {description}
                </p>
            </article>
            
            {ctaUrl && ctaText && (
                <Link to={ctaUrl} className="group">
                    <button
                        type="button"
                        className="flex items-center justify-center gap-2 px-6 h-12 w-full md:w-auto 
                                   bg-dark-100 text-white text-sm font-bold rounded-xl
                                   transition-all duration-200 ease-in-out cursor-pointer
                                   hover:bg-dark-200 active:scale-[0.96]"
                    >
                        {/* High-density icon: thick stroke, small size */}
                        <svg 
                            width="14" 
                            height="14" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="3.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className="mr-1"
                        >
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        {ctaText}
                    </button>
                </Link>
            )}
        </header>
    )
}

export default Header

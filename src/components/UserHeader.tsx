import { cn } from '../lib/utils'
import { Link, useLocation } from 'react-router-dom'
import { Plus, Compass } from 'lucide-react'

interface Props {
    title: string;
    description: string;
    ctaUrl?: string;
    ctaText?: string;
}

const UserHeader = ({ title, description, ctaText, ctaUrl }: Props) => {
    const location = useLocation()
    const isHome = location.pathname.includes("/Home")

    return (
        <header className="relative flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12">
            {/* The "Anchor" line - subtle and sophisticated */}
            <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-dark-100/10 via-dark-100/5 to-transparent" />
            
            <article className="relative mt-6 space-y-3">
               
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-dark-100/40">
                    <Compass size={12} strokeWidth={3} />
                    <span>nexa travel / {isHome ? "Root" : "Node"}</span>
                </div>

                <h1 className={cn(
                    "3text-dark-100 mt-6 tracking-tighter transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1)", 
                    isHome 
                        ? "text-4xl md:text-6xl font-extrabold" 
                        : "text-3xl md:text-4xl font-bold"
                )}>
                    {title}
                </h1>

                <p className="text-dark-100/60 font-medium leading-relaxed max-w-[480px] text-sm md:text-base border-l-2 border-dark-100/10 pl-4">
                    {description}
                </p>
            </article>
            
            {ctaUrl && ctaText && (
                <div className="flex items-center">
                    <Link to={ctaUrl} className="group relative overflow-hidden rounded-2xl bg-dark-100 px-8 py-4 transition-all duration-300 hover:shadow-2xl hover:shadow-dark-100/20 active:scale-95">
                        {/* Shimmer Effect Layer */}
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                        
                        <div className="relative flex items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 transition-colors group-hover:bg-white/20">
                                <Plus size={14} strokeWidth={3.5} className="text-white" />
                            </div>
                            <span className="text-sm font-bold tracking-tight text-white">{ctaText}</span>
                        </div>
                    </Link>
                </div>
            )}
        </header>
    )
}

export default UserHeader

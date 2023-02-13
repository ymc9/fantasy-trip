export default function Navbar() {
    return (
        <div className="navbar bg-base-100">
            <div className="navbar-start">
                <div className="dropdown">
                    <label tabIndex={0} className="btn-ghost btn lg:hidden">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h8m-8 6h16"
                            />
                        </svg>
                    </label>
                    <ul
                        tabIndex={0}
                        className="dropdown-content menu rounded-box menu-compact mt-3 w-52 bg-base-100 p-2 shadow"
                    >
                        <li>
                            <a>HOME</a>
                        </li>
                        <li>
                            <a>DESTINATIONS</a>
                        </li>
                        <li>
                            <a>ABOUT US</a>
                        </li>
                        <li>
                            <a>CART</a>
                        </li>
                    </ul>
                </div>
                <a className="btn-ghost btn text-xl normal-case">FantasyTrip</a>
            </div>
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">
                    <li>
                        <a>HOME</a>
                    </li>
                    <li>
                        <a>DESTINATIONS</a>
                    </li>
                    <li>
                        <a>ABOUT US</a>
                    </li>
                    <li>
                        <a>CART</a>
                    </li>
                </ul>
            </div>
            <div className="navbar-end">
                <a href="tel:+11234567890">📞 +1 123 456 7890</a>
            </div>
        </div>
    );
}

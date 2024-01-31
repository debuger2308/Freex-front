"use client"
import Link from 'next/link';
import './auth.css'

const Auth = () => {

    // const []

    return (
        <main className="auth">

            <div className="auth__container">
                <div className="auth__content">
                    <h1 className='auth__title'>Freex</h1>
                    <div className="auth__content-text">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quidem, quam sapiente. Tempora quas natus pariatur deserunt esse vero nesciunt numquam?</div>
                </div>

                <form
                    onSubmit={(e) => e.preventDefault()}
                    className="auth__form"
                >

                    <div className="auth__input-field">
                        <input type="text" id='nickname' name="nickname" className='auth__input' placeholder=' ' />
                        <label htmlFor="nickname" className="auth__input-label">Nickname</label>
                    </div>
                    <div className="auth__input-field">
                        <input type="text" id='password' name="password" className='auth__input' placeholder=' ' />
                        <label htmlFor="password" className="auth__input-label">Password</label>
                    </div>



                    <button
                        type="submit"
                        className="auth__submit-btn"
                    >
                        Log In
                    </button>
                    <Link href="/reset-password" className='auth__link-reset-pass'>
                        Forgot password?
                    </Link>
                    
                    <hr className='auth__decoration-line'/>

                    <Link href="/registration" className='auth__link-create-user'>
                        Create new account
                    </Link>
                </form>


            </div>



        </main>
    );
}

export default Auth;
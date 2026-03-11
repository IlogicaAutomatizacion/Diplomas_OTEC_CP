import formarteLogo from '../../assets/Formarte/estrellaLogo.png'

export default () => {
    return <div className="absolute size-15 xl:size-25 hidden xl:visible left-80 mt-5 xl:flex flex-row justify-center items-center top-0 object-cover ">
        <img
            src={formarteLogo}
            alt="logo"
        />
        <p className='text-[36px] text-[#199CD8] absolute ml-55 mt-17 font-semibold'>FORMARTE</p>
    </div >
}
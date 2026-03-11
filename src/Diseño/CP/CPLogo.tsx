import CPLogo from '../../assets/CP/CxPLogo.png'

export default () => {
    return <div className="absolute size-48 hidden xl:visible left-80 mt-5 xl:flex flex-row justify-center items-center top-0 object-cover ">
        <img
            src={CPLogo}
            alt="logo"
        />
    </div>
}
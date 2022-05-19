

const Error = ({ statusCode }) => {
    return (
        <p>
            {statusCode
            ? 'An error occured on server.. please wait..'
            : 'An error occured on client.. please wait..'}
        </p>
    );
}

Error.getInitialProps = ({ res, err }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
}

export default Error;
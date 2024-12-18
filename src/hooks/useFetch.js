const UseFetch = async (path, options) => {
  try {

    const res = await fetch("https://english-be.vercel.app/api/" + path, {
      ...options,
    });

    const data = await res.json();

    return { data };
  } catch (error) {
    return {
      data: null,
    };
  }
};

export default UseFetch;

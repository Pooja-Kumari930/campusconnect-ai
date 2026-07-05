const Loader = ({ fullScreen = false, label = "Loading..." }) => {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className="h-9 w-9 rounded-full border-[3px] border-primary-200 border-t-primary-500 animate-spin" />
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        {spinner}
      </div>
    );
  }
  return <div className="flex justify-center py-10">{spinner}</div>;
};

export default Loader;

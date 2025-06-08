import '../../css/home.css';
import * as React from 'react';
import { useSelector } from 'react-redux';

// components
import LaunchButton from '../../utils/launchButton';
import Dialogue from '../../utils/dialogue';

export default function Home(){
  const [isError, setIsError] = React.useState(false);
  const dialogue = useSelector((state) => state.dialogue.dialogue);

  const triggerErrorShake = () => {
    setIsError(true);
    setTimeout(() => setIsError(false), 300);
  };

  return (
      <main className='home'>
          <LaunchButton triggerErrorShake={triggerErrorShake} />
          <Dialogue dialogue={dialogue} isError={isError} />
      </main>
  );
}
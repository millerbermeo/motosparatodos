import { fmtCOP } from '../../utils';
import StatTile from './StatTile';

const renderCuotaTile = (label: string, valor?: number) =>
  typeof valor === 'number' ? <StatTile key={label} label={label} value={fmtCOP(valor)} /> : null;


export default renderCuotaTile
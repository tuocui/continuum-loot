import React from 'react';
import PropTypes from 'prop-types';

import MaterialTable from 'material-table';
import Paper from '@material-ui/core/Paper';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import IconButton from '@material-ui/core/IconButton';
import Edit from '@material-ui/icons/Edit';
import Check from '@material-ui/icons/Check';
import Clear from '@material-ui/icons/Clear';
import  { styled } from '@material-ui/core/styles';

import CustomPropTypes from './CustomPropTypes.js';
import Api from './Api.js';

const DarkPaper = styled(Paper)({
  background: '#EEE',
});

// TODO: Refactor away from material-table (overkill for this task)
export function WishlistRow(props) {
  var wishlistData = {'name': 'Wishlist'};
  for (const item of props.rowData.wishlist) {
    wishlistData[item.prio] = item.item_id;
  }

  var wishlistLookup = {};
  for (const item of props.items) {
    wishlistLookup[item.id] = item.name;
  }

  const customEditComponent = index => (xProps => (
    <WishlistEditItem
      items={props.items}
      initialValue={props.items.find(x => x.id === wishlistData[index])}
      onChange={xProps.onChange}
    />
  ));

  return (
    <MaterialTable
      //components={{Container: DarkPaper}}
      columns={[
        {title: '', field: 'name', editable: 'never', cellStyle: {fontWeight: '500'}}, 
        {title: 'First', field: '1', lookup: wishlistLookup, editComponent: customEditComponent(1)},
        {title: 'Second', field: '2', lookup: wishlistLookup, editComponent: customEditComponent(2)},
        {title: 'Third', field: '3', lookup: wishlistLookup, editComponent: customEditComponent(3)},
        {title: 'Fourth', field: '4', lookup: wishlistLookup, editComponent: customEditComponent(4)},
        {title: 'Fifth', field: '5', lookup: wishlistLookup, editComponent: customEditComponent(5)},
        {title: 'Sixth', field: '6', lookup: wishlistLookup, editComponent: customEditComponent(6)},
        {title: 'Seventh', field: '7', lookup: wishlistLookup, editComponent: customEditComponent(7)},
        {title: 'Eighth', field: '8', lookup: wishlistLookup, editComponent: customEditComponent(8)},
        {title: 'Ninth', field: '9', lookup: wishlistLookup, editComponent: customEditComponent(9)},
        {title: 'Tenth', field: '10', lookup: wishlistLookup, editComponent: customEditComponent(10)},
      ]}
      data={[wishlistData]}
      options={ { sorting: false, paging: false, showTitle: false, toolbar: false, draggable: props.editable } }
      localization={{header: {actions: ''}}}
      editable={ {
        isEditable: _ => props.editable,
        isEditHidden: _ => !props.editable,
        onRowUpdate: (newData, _oldData) => {
          var updatedPlayer = props.rowData;
          updatedPlayer.wishlist = [];
          for (const prio in newData) {
            if (prio !== 'name' && newData[prio] !== null) {
              updatedPlayer.wishlist.push({'prio': prio, 'item_id': newData[prio]});
            }
          }
          return new Promise((resolve, _reject) => {
            Api.player.update(updatedPlayer, props.updateRemoteData);
            resolve();
          });
        },
      } }
      onColumnDragged={ (sourceIndex, destIndex) => {
        if (sourceIndex === destIndex) {
          return;
        }

        var updated = false;
        var updatedPlayer = props.rowData;

        const movedItemIndex = updatedPlayer.wishlist.findIndex(i => i.prio === sourceIndex);
        const diff = sourceIndex > destIndex ? 1 : -1;  // Which way do intermediate items get moved
        const lowerBound = sourceIndex > destIndex ? destIndex - 1 : sourceIndex;
        const upperBound = sourceIndex > destIndex ? sourceIndex - 1 : destIndex;

        for (var itemIndex = 0; itemIndex < updatedPlayer.wishlist.length; itemIndex++) {
          const prio = updatedPlayer.wishlist[itemIndex].prio;
          if (prio > lowerBound && prio <= upperBound) {
            updatedPlayer.wishlist[itemIndex].prio += diff;
            updated = true;
          }
        }

        // undefined check if moving empty col
        if (updatedPlayer.wishlist[movedItemIndex]) {
          updatedPlayer.wishlist[movedItemIndex].prio = destIndex;
          updated = true;
        }

        if (updated) {
          Api.player.update(updatedPlayer, props.updateRemoteData);
        }
      } }
    />
  );
}

WishlistRow.propTypes = {
  rowData: CustomPropTypes.player.isRequired,
  items: PropTypes.arrayOf(CustomPropTypes.item).isRequired,
  updateRemoteData: PropTypes.func.isRequired,
  editable: PropTypes.bool,
}

WishlistRow.defaultProps = {
  editable: false,
}

// TODO: Refactor this and PriorityEditIndividual together
function WishlistEditItem(props) {
  const [inputValue, setInputValue] = React.useState('');
  const [value, setValue] = React.useState(props.initialValue);
  return (
    <Autocomplete
      options={props.items}
      getOptionLabel={option => option.name}
      value={value}
      onChange={(e, newVal) => { setValue(newVal); props.onChange(newVal ? newVal.id : null); }}
      inputValue={inputValue}
      onInputChange={(e, newInputVal) => { setInputValue(newInputVal); }}
      renderInput={params => <TextField {...params} />}
    />
  );
}

WishlistEditItem.propTypes = {
  items: PropTypes.arrayOf(CustomPropTypes.item).isRequired,
  initialValue: CustomPropTypes.item.isRequired,
  onChange: PropTypes.func.isRequired,
}

// TODO: Refactor away from material-table (overkill for this task)
export function AttendanceRow(props) {
  
  const yesStyle = {fontWeight: '500', color: '#4CAF50'};
  const noStyle = {fontWeight: '500', color: '#F44336'};

  // 45 is a "good enough" attempt to get the first columns lined up
  var attendanceColumns = [{width: 45}, {title: '', field: 'name', cellStyle: {fontWeight: '500'}}];
  var attendanceData = {'name': 'Attendance'};
  
  const numRaids = 12;
  const lastXRaidDays = props.raidDays.slice(0, numRaids).reverse();
  for (var i=0; i<numRaids; i++) {
    attendanceData[i.toString()] = props.rowData.attendance.includes(lastXRaidDays[numRaids-1-i].id) ? 'Yes' : 'No';
    attendanceColumns.push({title: lastXRaidDays[numRaids-1-i].name,
                            field: i.toString(),
                            cellStyle: cellData => cellData === 'Yes' ? yesStyle : noStyle,
    });
  }

  return (
    <MaterialTable
      //components={{Container: DarkPaper}}
      columns={attendanceColumns}
      data={[attendanceData]}
      options={ { sorting: false, paging: false, showTitle: false, toolbar: false, draggable: false } }
    />
  );
}

AttendanceRow.propTypes = {
  rowData: CustomPropTypes.player.isRequired,
  raidDays: PropTypes.arrayOf(CustomPropTypes.raidDay).isRequired,
}

// TODO: Refactor - combine with LootHistoryItemsRow
export function LootHistoryRow(props) {
  var itemLookup = {};
  for (const item of props.items) {
    itemLookup[item.id] = item.name;
  }

  const numItems = 6;
  const lastXItems = props.lootHistory.filter(x => x.player_id === props.rowData.id).slice(0, numItems).reverse();

  const filterFunc = i => (x => x.id === lastXItems[i].raid_day_id);

  var headerData = [];
  var itemData = [];

  for (let i=lastXItems.length-1; i>=0; i--) {
    headerData.push(props.raidDays.find(filterFunc(i)).name);
    itemData.push(itemLookup[lastXItems[i].item_id]);
  }

  for (let i=lastXItems.length; i<numItems; i++) {
    headerData.push('');
    itemData.push('');
  }

  const headerRow = lastXItems.length > 0 ? (
    <TableHead>
      <TableRow>
        <TableCell className="no-width-fix" />
        {headerData.map((data, index) =>
          <TableCell key={index}>{data}</TableCell>
        )}
      </TableRow>
    </TableHead>
  ) : null;

  if (lastXItems.length === 0) {
    itemData[0] = 'None';
  }

  return (
    <TableContainer component={DarkPaper}>
      <Table size="small" style={{tableLayout: 'fixed'}}>
        {headerRow}
        <TableBody>
          <TableRow>
            <TableCell variant='head' style={{textAlign: 'center'}}>Recent Items Won</TableCell>
            {itemData.map((data, index) =>
              <TableCell key={index}>{data}</TableCell>
            )}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

LootHistoryRow.propTypes = {
  rowData: CustomPropTypes.player.isRequired,
  lootHistory: PropTypes.arrayOf(CustomPropTypes.lootHistory).isRequired,
  items: PropTypes.arrayOf(CustomPropTypes.item).isRequired,
  raidDays: PropTypes.arrayOf(CustomPropTypes.raidDay).isRequired,
}

// TODO: Add drag'n'drop with react-sortable-hoc
// TODO: Refactor for more/less than 3 prios
export function PriorityRow(props) {
  const initialValue = {
    individual: {
      1: {},
      2: {},
      3: {},
    },
    class: {
      1: {},
      2: {},
      3: {},
    },
  };

  for (let i = 1; i <= 3; i++) {
    const currentIndividual = props.rowData.individual_prio.find(x => x.prio === i);
    if (currentIndividual) {
      const player = props.players.find(x => x.id === currentIndividual.player_id);
      const setBy = props.players.find(x => x.id === currentIndividual.set_by);
      initialValue.individual[i] = {player: player, setBy: setBy};
    }

    const currentClass = props.rowData.class_prio.find(x => x.prio === i);
    if (currentClass) {
      const setBy = props.players.find(x => x.id === currentClass.set_by);
      initialValue.class[i] = {class: currentClass.class, setBy: setBy};
    }
  }

  const [editingIndividual, setEditingIndividual] = React.useState(false);
  const [editingClass, setEditingClass] = React.useState(false);
  const [individualOne, setIndividualOne] = React.useState(initialValue.individual[1].player);
  const [individualTwo, setIndividualTwo] = React.useState(initialValue.individual[2].player);
  const [individualThree, setIndividualThree] = React.useState(initialValue.individual[3].player);
  const [classOne, setClassOne] = React.useState(initialValue.class[1].class);
  const [classTwo, setClassTwo] = React.useState(initialValue.class[2].class);
  const [classThree, setClassThree] = React.useState(initialValue.class[3].class);


  const saveIndividual = () => {
    setEditingIndividual(false);

    var newIndividualPrio = [];

    if (individualOne) {
      const setBy = individualOne === initialValue.individual[1].player
                     ? initialValue.individual[1].setBy.id
                     : props.loggedInPlayer.id;
      newIndividualPrio.push({player_id: individualOne.id, prio: 1, set_by: setBy});
    }

    if (individualTwo) {
      const setBy = individualTwo === initialValue.individual[2].player
                     ? initialValue.individual[2].setBy.id
                     : props.loggedInPlayer.id;
      newIndividualPrio.push({player_id: individualTwo.id, prio: 2, set_by: setBy});
    }

    if (individualThree) {
      const setBy = individualThree === initialValue.individual[3].player
                     ? initialValue.individual[3].setBy.id
                     : props.loggedInPlayer.id;
      newIndividualPrio.push({player_id: individualThree.id, prio: 3, set_by: setBy});
    }

    props.rowData.individual_prio = newIndividualPrio;
    Api.item.update(props.rowData, props.updateRemoteData);
  }

  const saveClass = () => {
    setEditingClass(false);

    var newClassPrio = [];

    if (classOne) {
      const setBy = classOne === initialValue.class[1].class
                     ? initialValue.class[1].setBy.id
                     : props.loggedInPlayer.id;
      newClassPrio.push({class: classOne, prio: 1, set_by: setBy});
    }

    if (classTwo) {
      const setBy = classTwo === initialValue.class[2].class
                     ? initialValue.class[2].setBy.id
                     : props.loggedInPlayer.id;
      newClassPrio.push({class: classTwo, prio: 2, set_by: setBy});
    }

    if (classThree) {
      const setBy = classThree === initialValue.class[3].class
                     ? initialValue.class[3].setBy.id
                     : props.loggedInPlayer.id;
      newClassPrio.push({class: classThree, prio: 3, set_by: setBy});
    }

    props.rowData.class_prio = newClassPrio;
    Api.item.update(props.rowData, props.updateRemoteData);
  }

  const clear = () => {
    setEditingIndividual(false);
    setEditingClass(false);
    setIndividualOne(initialValue.individual[1].player);
    setIndividualTwo(initialValue.individual[2].player);
    setIndividualThree(initialValue.individual[3].player);
    setClassOne(initialValue.class[1].class);
    setClassTwo(initialValue.class[2].class);
    setClassThree(initialValue.class[3].class);
  }

  var individualButtons;
  var classButtons;
  if (!props.editable) {
    individualButtons = null;
    classButtons = null;
  } else if (editingIndividual) {
    individualButtons = (
      <>
        <IconButton size="small" onClick={saveIndividual}>
          <Check />
        </IconButton>
        <IconButton size="small" onClick={clear}>
          <Clear />
        </IconButton>
      </>
    );
    classButtons = null;
  } else if (editingClass) {
    classButtons = (
      <>
        <IconButton size="small" onClick={saveClass}>
          <Check />
        </IconButton>
        <IconButton size="small" onClick={clear}>
          <Clear />
        </IconButton>
      </>
    );
    individualButtons = null;
  } else {
    individualButtons = (
      <IconButton size="small" onClick={() => setEditingIndividual(true)}>
        <Edit />
      </IconButton>
    );
    classButtons = (
      <IconButton size="small" onClick={() => setEditingClass(true)}>
        <Edit />
      </IconButton>
    );
  }

  var individualCells  = (
    <>
      <TableCell>{individualOne ? individualOne.name : null}</TableCell>
      <TableCell>{individualTwo ? individualTwo.name : null}</TableCell>
      <TableCell>{individualThree ? individualThree.name : null}</TableCell>
    </>
  );

  if (editingIndividual) {
    individualCells = (
      <>
        <TableCell>
          <PriorityEditIndividual players={props.players} initialValue={individualOne} onChange={setIndividualOne} />
        </TableCell>
        <TableCell>
          <PriorityEditIndividual players={props.players} initialValue={individualTwo} onChange={setIndividualTwo} />
        </TableCell>
        <TableCell>
          <PriorityEditIndividual players={props.players} initialValue={individualThree} onChange={setIndividualThree} />
        </TableCell>
      </>
    );
  }

  var classCells = (
    <>
      <TableCell>{classOne}</TableCell>
      <TableCell>{classTwo}</TableCell>
      <TableCell>{classThree}</TableCell>
    </>
  );

  if (editingClass) {
    classCells = (
      <>
        <TableCell><TextField value={classOne} onChange={e => setClassOne(e.target.value)} /></TableCell>
        <TableCell><TextField value={classTwo} onChange={e => setClassTwo(e.target.value)} /></TableCell>
        <TableCell><TextField value={classThree} onChange={e => setClassThree(e.target.value)} /></TableCell>
      </>
    );
  }

  return (
    <TableContainer component={DarkPaper}>
      <Table size="small" style={{tableLayout: 'fixed'}}>
        <TableHead>
          <TableRow>
            <TableCell className="no-width-fix" />
            <TableCell />
            <TableCell>First</TableCell>
            <TableCell>Second</TableCell>
            <TableCell>Third</TableCell>
            <TableCell />
            <TableCell />
            <TableCell>First</TableCell>
            <TableCell>Second</TableCell>
            <TableCell>Third</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell style={{textAlign: 'right'}}>{individualButtons}</TableCell>
            <TableCell variant='head'>Individual Prio</TableCell>
            {individualCells}
            <TableCell style={{textAlign: 'right'}}>{classButtons}</TableCell>
            <TableCell variant='head'>Class Prio</TableCell>
            {classCells}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

PriorityRow.propTypes = {
  rowData: CustomPropTypes.item.isRequired,
  players: PropTypes.arrayOf(CustomPropTypes.player).isRequired,
  loggedInPlayer: CustomPropTypes.user,
  updateRemoteData: PropTypes.func.isRequired,
  editable: PropTypes.bool,
}

PriorityRow.defaultProps = {
  loggedInPlayer: null,
  editable: false,
}

// TODO: Refactor this and WishlistEditItem together
function PriorityEditIndividual(props) {
  const [inputValue, setInputValue] = React.useState('');
  const [value, setValue] = React.useState(props.initialValue);
  return (
    <Autocomplete
      options={props.players}
      getOptionLabel={option => option.name}
      value={value}
      onChange={(e, newVal) => { setValue(newVal); props.onChange(newVal); }}
      inputValue={inputValue}
      onInputChange={(e, newInputVal) => { setInputValue(newInputVal); }}
      renderInput={params => <TextField {...params} />}
    />
  );
}

PriorityEditIndividual.propTypes = {
  initialValue: CustomPropTypes.player.isRequired,
  players: PropTypes.arrayOf(CustomPropTypes.player).isRequired,
  onChange: PropTypes.func.isRequired,
}

// TODO: Refactor - combine with LootHistoryRow
export function LootHistoryItemsRow(props) {
  var playerLookup = {};
  for (const player of props.players) {
    playerLookup[player.id] = player.name;
  }

  const numPlayers = 6;
  const lastXPlayers = props.lootHistory.filter(x => x.item_id === props.rowData.id).slice(0, numPlayers).reverse();

  const filterFunc = i => (x => x.id === lastXPlayers[i].raid_day_id);

  var headerData = [];
  var playerData = [];

  for (let i=lastXPlayers.length-1; i>=0; i--) {
    headerData.push(props.raidDays.find(filterFunc(i)).name);
    playerData.push(playerLookup[lastXPlayers[i].player_id]);
  }

  for (let i=lastXPlayers.length; i<numPlayers; i++) {
    headerData.push('');
    playerData.push('');
  }

  const headerRow = lastXPlayers.length > 0 ? (
    <TableHead>
      <TableRow>
        <TableCell className="no-width-fix" />
        {headerData.map((data, index) =>
          <TableCell key={index}>{data}</TableCell>
        )}
      </TableRow>
    </TableHead>
  ) : null;

  if (lastXPlayers.length === 0) {
    playerData[0] = 'None';
  }

  return (
    <TableContainer component={DarkPaper}>
      <Table size="small" style={{tableLayout: 'fixed'}}>
        {headerRow}
        <TableBody>
          <TableRow>
            <TableCell variant='head' style={{textAlign: 'center'}}>Recent Recipients</TableCell>
            {playerData.map((data, index) =>
              <TableCell key={index}>{data}</TableCell>
            )}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

LootHistoryItemsRow.propTypes = {
  rowData: CustomPropTypes.item.isRequired,
  lootHistory: PropTypes.arrayOf(CustomPropTypes.lootHistory).isRequired,
  players: PropTypes.arrayOf(CustomPropTypes.player).isRequired,
  raidDays: PropTypes.arrayOf(CustomPropTypes.raidDay).isRequired,
}

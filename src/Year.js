import PropTypes from 'prop-types'
import React from 'react'
import cn from 'classnames'

import dates from './utils/dates'
import chunk from 'lodash/chunk'

import { navigate } from './utils/constants'

class YearView extends React.Component {
  render() {
    let { date, localizer, className } = this.props,
      month = dates.visibleDays(date, localizer),
      weeks = chunk(month, 7)

    const monthRows = chunk(dates.monthsInYear(dates.year(date)), 4)

    this._weekCount = weeks.length

    return (
      <div className={cn(className)}>
        {monthRows.map((row, key) => (
          <div className="month-row" key={key}>
            {row.map(this.renderMonth)}
          </div>
        ))}
      </div>
    )
  }

  renderMonth = monthStartDate => {
    const { localizer } = this.props
    const monthDays = dates.visibleDays(monthStartDate, localizer)
    const weeks = chunk(monthDays, 7)
    const monthLabel = this.props.localizer.format(monthStartDate, 'MMMM')

    return (
      <div className="year-month" key={monthLabel}>
        <div className="month-header">{monthLabel}</div>
        <div className="month-weekdays">{this.renderHeaders(weeks[0])}</div>
        <div className="month-days">
          {weeks.map((weekDays, key) => {
            return (
              <div className="year-week" key={key}>
                {weekDays.map(day => this.renderDay(day, monthStartDate))}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  renderHeaders(row) {
    let { localizer } = this.props
    let first = row[0]
    let last = row[row.length - 1]

    return dates.range(first, last, 'day').map((day, idx) => (
      <div key={'header_' + idx} className="weekday-header">
        {localizer.format(day, 'dd')}
      </div>
    ))
  }

  renderDay = (day, monthStartDate) => {
    const { localizer } = this.props
    const label = localizer.format(day, 'dateFormat')

    return (
      <div
        className={cn('year-day', {
          'out-of-range-day': dates.month(day) !== dates.month(monthStartDate),
        })}
        key={label}
      >
        {localizer.format(day, 'dateFormat')}
      </div>
    )
  }
}

YearView.propTypes = {
  events: PropTypes.array.isRequired,
  date: PropTypes.instanceOf(Date),

  min: PropTypes.instanceOf(Date),
  max: PropTypes.instanceOf(Date),

  step: PropTypes.number,
  getNow: PropTypes.func.isRequired,

  scrollToTime: PropTypes.instanceOf(Date),
  rtl: PropTypes.bool,
  width: PropTypes.number,

  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object.isRequired,
  localizer: PropTypes.object.isRequired,

  selected: PropTypes.object,
  selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
  longPressThreshold: PropTypes.number,

  onNavigate: PropTypes.func,
  onSelectSlot: PropTypes.func,
  onSelectEvent: PropTypes.func,
  onDoubleClickEvent: PropTypes.func,
  onShowMore: PropTypes.func,
  onDrillDown: PropTypes.func,
  getDrilldownView: PropTypes.func.isRequired,

  popup: PropTypes.bool,

  popupOffset: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
    }),
  ]),
}

YearView.range = (date, { localizer }) => {
  let start = dates.firstYearVisibleDay(date, localizer)
  let end = dates.lastYearVisibleDay(date, localizer)
  return { start, end }
}

YearView.navigate = (date, action) => {
  switch (action) {
    case navigate.PREVIOUS:
      return dates.add(date, -1, 'year')

    case navigate.NEXT:
      return dates.add(date, 1, 'year')

    default:
      return date
  }
}

YearView.title = (date, { localizer }) => localizer.format(date, 'YYYY')

export default YearView

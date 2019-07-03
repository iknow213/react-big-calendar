import PropTypes from 'prop-types'
import React from 'react'
import cn from 'classnames'

import dates from './utils/dates'
import chunk from 'lodash/chunk'

import { navigate } from './utils/constants'
import { inRange } from './utils/eventLevels'
import Popup from './Popup'
import Overlay from 'react-overlays/Overlay'
import getPosition from 'dom-helpers/query/position'
import { findDOMNode } from 'react-dom'

class YearView extends React.Component {
  constructor(...args) {
    super(...args)

    this.state = {
      overlay: null,
    }

    this.eventsByDay = new Map()
  }

  render() {
    let { date, localizer, className } = this.props,
      month = dates.visibleDays(date, localizer),
      weeks = chunk(month, 7)

    const monthRows = chunk(dates.monthsInYear(dates.year(date)), 4)

    this._weekCount = weeks.length

    return (
      <div
        className={cn(className)}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
      >
        {monthRows.map((row, key) => (
          <div className="month-row" key={key}>
            {row.map(this.renderMonth)}
          </div>
        ))}
        {this.props.popup && this.renderOverlay()}
      </div>
    )
  }

  handleMouseDown = e => {
    this.setState({ firstSelected: null, lastSelected: null })
    if (!e.target || !e.target.dataset.date) {
      return
    }
    this.lastSelected = e.target.dataset.date
    this.selectionStart = Date.parse(e.target.dataset.date)
    this.setState({ firstSelected: this.selectionStart, lastSelected: null })
  }

  handleMouseUp = e => {
    if (!this.selectionStart || !e.target || !e.target.dataset.date) {
      return
    }
    this.props.onSelectSlot({
      start: this.selectionStart,
      end: Date.parse(e.target.dataset.date),
    })
    this.selectionStart = null
  }

  handleMouseMove = e => {
    if (!this.selectionStart || !e.target || !e.target.dataset.date) {
      return
    }
    const nextDate = e.target.dataset.date
    if (this.lastSelected !== nextDate) {
      this.lastSelected = nextDate
      this.setState({ lastSelected: Date.parse(nextDate) })
    }
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
    const dayEvents = this.getDayEvents(day)
    const isOutOfMonth = dates.month(day) !== dates.month(monthStartDate)

    let style = {}
    if (
      day >= this.state.firstSelected &&
      day <= this.state.lastSelected &&
      !isOutOfMonth
    ) {
      style = { background: 'lightblue' }
    }

    if (dayEvents.length && !isOutOfMonth) {
      return this.renderDayWithEvents(day, label, dayEvents)
    }

    return (
      <div
        className={cn('year-day', {
          'out-of-range-day': isOutOfMonth,
        })}
        style={style}
        key={label}
        data-date={day.toISOString()}
      >
        {label}
      </div>
    )
  }

  renderDayWithEvents(day, label, dayEvents) {
    return (
      <a
        key={label}
        href="#"
        className={cn('year-day', 'with-events')}
        onClick={e => this.handleShowMore(e, dayEvents, day)}
      >
        {label}
      </a>
    )
  }

  handleShowMore = (e, events, date, cell, slot, target) => {
    e.preventDefault()
    const { popup } = this.props

    if (popup) {
      let position = getPosition(e.target, findDOMNode(this))

      this.setState({
        overlay: { date, events, position, target },
      })
    }
  }

  getDayEvents = date => {
    const key = date.toString()
    if (this.eventsByDay.has(key)) {
      return this.eventsByDay.get(key)
    }

    const events = this.props.events.filter(e =>
      inRange(
        e,
        dates.startOf(date, 'day'),
        dates.endOf(date, 'day'),
        this.props.accessors
      )
    )

    this.eventsByDay.set(key, events)
    return events
  }

  renderOverlay() {
    let overlay = (this.state && this.state.overlay) || {}
    let { accessors, localizer, components, getters, selected } = this.props

    return (
      <Overlay
        rootClose
        placement="bottom"
        container={this}
        show={!!overlay.position}
        onHide={() => this.setState({ overlay: null })}
        target={() => overlay.target}
      >
        {({ props }) => (
          <Popup
            {...props}
            accessors={accessors}
            getters={getters}
            selected={selected}
            components={components}
            localizer={localizer}
            position={overlay.position}
            events={overlay.events}
            slotStart={overlay.date}
            slotEnd={overlay.end}
            onSelect={this.handleSelectEvent}
            onDoubleClick={this.handleDoubleClickEvent}
          />
        )}
      </Overlay>
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

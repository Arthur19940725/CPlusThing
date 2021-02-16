import React from 'react'
import { Select } from '../lib/select'
import { Button } from '../lib/button'
import { Row } from '../lib/row'
import { Popover, PopoverCaretPosition } from '../lib/popover'
import { IAvatarUser } from '../../models/avatar'
import { Avatar } from '../lib/avatar'
import { Octicon, OcticonSymbol } from '../octicons'
import { LinkButton } from '../lib/link-button'

interface ICommitMessageAvatarState {
  readonly isPopoverOpen: boolean

  /** Currently selected account email address. */
  readonly accountEmail: string
}

interface ICommitMessageAvatarProps {
  /** The user whose avatar should be displayed. */
  readonly user?: IAvatarUser

  /**
   * The title of the avatar.
   * Defaults to the name and email if undefined and is
   * skipped completely if title is null
   */
  readonly title?: string | null

  /** Current email address configured by the user. */
  readonly email?: string

  /** Whether or not the warning badge on the avatar should be visible. */
  readonly warningBadgeVisible: boolean

  /** Whether or not the user's account is a GHE account. */
  readonly isEnterpriseAccount: boolean

  /** Email addresses available in the relevant GitHub (Enterprise) account. */
  readonly accountEmails: ReadonlyArray<string>

  /** Preferred email address from the user's account. */
  readonly preferredAccountEmail: string

  readonly onSave: (email: string) => void

  readonly onIgnore: () => void
}

/**
 * User avatar shown in the commit message area. It encapsulates not only the
 * user avatar, but also any badge and warning we might display to the user.
 */
export class CommitMessageAvatar extends React.Component<
  ICommitMessageAvatarProps,
  ICommitMessageAvatarState
> {
  public constructor(props: ICommitMessageAvatarProps) {
    super(props)

    this.state = {
      isPopoverOpen: false,
      accountEmail: this.props.preferredAccountEmail,
    }
  }

  public render() {
    return (
      <div className="commit-message-avatar-component">
        <div onClick={this.onAvatarClick}>
          {this.props.warningBadgeVisible && this.renderWarningBadge()}
          <Avatar user={this.props.user} title={this.props.title} />
        </div>
        {this.state.isPopoverOpen && this.renderPopover()}
      </div>
    )
  }

  private renderWarningBadge() {
    return (
      <div className="warning-badge">
        <Octicon symbol={OcticonSymbol.alert} />
      </div>
    )
  }

  private openPopover = () => {
    this.setState(prevState => {
      if (prevState.isPopoverOpen === false) {
        return { isPopoverOpen: true }
      }
      return null
    })
  }

  private closePopover = () => {
    this.setState(prevState => {
      if (prevState.isPopoverOpen) {
        return { isPopoverOpen: false }
      }
      return null
    })
  }

  private onAvatarClick = (event: React.FormEvent<HTMLDivElement>) => {
    if (this.props.warningBadgeVisible === false) {
      return
    }

    event.preventDefault()
    if (this.state.isPopoverOpen) {
      this.closePopover()
    } else {
      this.openPopover()
    }
  }

  private renderPopover() {
    const accountTypeSuffix = this.props.isEnterpriseAccount
      ? ' Enterprise'
      : ''

    return (
      <Popover
        caretPosition={PopoverCaretPosition.LeftTop}
        onClickOutside={this.closePopover}
      >
        <h3>This commit will be misattributed</h3>
        <Row>
          <div>
            The email in your{' '}
            <span className="highlighted-text">git config</span> (
            {this.props.email}) doesn't match your{' '}
            <span className="highlighted-text">
              GitHub{accountTypeSuffix} account
            </span>
            .{' '}
            <LinkButton uri="https://docs.github.com/en/github/committing-changes-to-your-project/why-are-my-commits-linked-to-the-wrong-user">
              Learn more.
            </LinkButton>
          </div>
        </Row>
        <Row>
          <Select
            value={this.state.accountEmail}
            onChange={this.onSelectedGitHubEmailChange}
          >
            {this.props.accountEmails.map(n => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </Row>
        <Row className="button-row">
          <Button onClick={this.onIgnoreClick} tooltip="Ignore" type="button">
            Ignore
          </Button>
          <Button onClick={this.onSaveClick} tooltip="Save" type="submit">
            Save
          </Button>
        </Row>
      </Popover>
    )
  }

  private onIgnoreClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    this.closePopover()
    this.props.onIgnore?.()
  }

  private onSaveClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    this.closePopover()

    if (this.props.email !== this.state.accountEmail) {
      this.props.onSave(this.state.accountEmail)
    }
  }

  private onSelectedGitHubEmailChange = (
    event: React.FormEvent<HTMLSelectElement>
  ) => {
    const email = event.currentTarget.value
    if (email) {
      this.setState({ accountEmail: email })
    }
  }
}

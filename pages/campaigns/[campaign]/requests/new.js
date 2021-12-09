import { Button, Form, Icon, Input, Message } from 'semantic-ui-react';
import React, { Component } from 'react';

import Campaign from '../../../../ethereum/campaign';
import Layout from '../../../../components/Layout';
import Link from 'next/link';
import Router from 'next/router';
import web3 from '../../../../ethereum/web3';

class RequestNew extends Component {
	state = {
		value: '',
		description: '',
		recipient: '',
		loading: false,
		errorMessage: '',
	};

	static async getInitialProps(context) {
		const { campaign } = context.query;
		return { address: campaign };
	}

	onSubmit = async (event) => {
		event.preventDefault();

		const campaign = Campaign(this.props.address);
		const { description, value, recipient } = this.state;

		this.setState({ loading: true, errorMessage: '' });

		try {
			const accounts = await web3.eth.getAccounts();
			await campaign.methods
				.createRequest(description, web3.utils.toWei(value, 'ether'), recipient)
				.send({ from: accounts[0] });

			Router.push(
				'/campaigns/[campaign]/requests',
				`/campaigns/${this.props.address}/requests`
			);
		} catch (err) {
			this.setState({ errorMessage: err.message });
		}

		this.setState({ loading: false });
	};

	render() {
		return (
			<Layout>
				<Link
					href='/campaigns/[campaign]/requests'
					as={`/campaigns/${this.props.address}/requests`}>
					<a
						style={{
							backgroundColor: '#3d3d3d',
							padding: '10px 20px',
							borderRadius: '8px',
						}}>
						<Icon name='chevron left' />
						Back
					</a>
				</Link>
				<h3>Create a Request</h3>
				<Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
					<Form.Field>
						<label style={{ color: '#fff' }}>Description</label>
						<Input
							value={this.state.description}
							onChange={(event) =>
								this.setState({ description: event.target.value })
							}
						/>
					</Form.Field>

					<Form.Field>
						<label style={{ color: '#fff' }}>Value in Ether</label>
						<Input
							value={this.state.value}
							onChange={(event) => this.setState({ value: event.target.value })}
						/>
					</Form.Field>

					<Form.Field>
						<label style={{ color: '#fff' }}>Recipient</label>
						<Input
							value={this.state.recipient}
							onChange={(event) =>
								this.setState({ recipient: event.target.value })
							}
						/>
					</Form.Field>

					<Message error header='Oops!' content={this.state.errorMessage} />
					<Button primary loading={this.state.loading}>
						Create!
					</Button>
				</Form>
			</Layout>
		);
	}
}

export default RequestNew;